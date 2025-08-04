"use server";

import { getAuthenticatedUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { TransactionType } from "@prisma/client";

async function getOrCreateDefaultEnvelope(userId: string) {
  const defaultEnvelopeName = "A classificar";
  let envelope = await prisma.envelope.findFirst({
    where: {
      userId,
      name: defaultEnvelopeName,
    },
  });

  if (!envelope) {
    envelope = await prisma.envelope.create({
      data: {
        userId,
        name: defaultEnvelopeName,
        value: 0,
        type: "MONETARY",
        isDeletable: true,
      },
    });
  }

  return envelope.id;
}

export async function importarTransacoes(transactions: any[]) {
  const { user } = await getAuthenticatedUser();

  const defaultEnvelopeId = await getOrCreateDefaultEnvelope(user.id);

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
      const existingTransaction = await prisma.transaction.findFirst({
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

      let type = "INCOME" as TransactionType;

      let amount = Math.round(parseFloat(t.VALOR.replace(",", ".")) * 100);

      if (amount < 0) {
        amount = amount * -1;
        type = "EXPENSE" as TransactionType;
      }

      await prisma.transaction.create({
        data: {
          userId: user.id,
          date: new Date(t.DATA.split("/").reverse().join("-")),
          description: t.DESCRIÇÃO,
          amount: amount,
          type,
          envelopeId: defaultEnvelopeId,
          importSessionId: importSession.id,
        },
      });

      importedCount++;
    } catch (error) {
      errorCount++;
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
  const { user } = await getAuthenticatedUser();

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
