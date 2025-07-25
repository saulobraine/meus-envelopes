"use server";

import { createClient } from "@/lib/supabase/server";
import { OperationType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getOrCreateDefaultCategory(userId: string) {
  const defaultCategoryName = "A classificar";
  let category = await prisma.category.findFirst({
    where: {
      userId,
      name: defaultCategoryName,
    },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        userId,
        name: defaultCategoryName,
      },
    });
  }

  return category.id;
}

export async function importarTransacoes(transactions: any[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const defaultCategoryId = await getOrCreateDefaultCategory(user.id);

  const importSession = await prisma.importSession.create({
    data: {
      userId: user.id,
      fileName: "importacao_manual", // ou passe o nome do arquivo
    },
  });

  let importedCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;

  for (const t of transactions) {
    try {
      // Lógica para verificar duplicatas (exemplo)
      const existingTransaction = await prisma.operation.findFirst({
        where: {
          description: t.DESCRIÇÃO,
          amount: Math.round(parseFloat(t.VALOR.replace(",", ".")) * 100),
          date: new Date(t.DATA.split("/").reverse().join("-")),
          userId: user.id,
        },
      });

      if (existingTransaction) {
        duplicateCount++;
        await prisma.importTransactionPreview.create({
          data: {
            importSessionId: importSession.id,
            status: "DUPLICATE",
            data: t,
          },
        });
        continue;
      }

      let type = "INCOME" as OperationType;

      let amount = Math.round(parseFloat(t.VALOR.replace(",", ".")) * 100);

      if (amount < 0) {
        amount = amount * -1;
        type = "EXPENSE" as OperationType;
      }

      await prisma.operation.create({
        data: {
          userId: user.id,
          date: new Date(t.DATA.split("/").reverse().join("-")),
          description: t.DESCRIÇÃO,
          amount: amount,
          type,
          categoryId: defaultCategoryId,
          importSessionId: importSession.id,
        },
      });

      importedCount++;
    } catch (error) {
      errorCount++;
      // Opcional: logar o erro ou a transação que falhou
    }
  }

  await prisma.importSession.update({
    where: { id: importSession.id },
    data: {
      importedCount,
      ignoredCount: duplicateCount,
      errorCount,
    },
  });

  return {
    importSessionId: importSession.id,
    importedCount,
    duplicateCount,
    errorCount,
  };
}

export async function resetarImportacao(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const session = await prisma.importSession.findUnique({
    where: { id: sessionId },
    select: { userId: true },
  });

  if (!session || session.userId !== user.id) {
    throw new Error("Sessão de importação não encontrada ou acesso negado.");
  }

  await prisma.$transaction([
    prisma.importTransactionPreview.deleteMany({
      where: { importSessionId: sessionId },
    }),
    prisma.importSession.delete({
      where: { id: sessionId },
    }),
  ]);
}
