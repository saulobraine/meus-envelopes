"use server";

import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { PreviewStatus } from "@prisma/client";

export async function editarStatusTransacao(
  previewId: string,
  novoStatus: PreviewStatus
) {
  const { user } = await getAuthenticatedUser();

  const preview = await prisma.importTransactionPreview.findUnique({
    where: { id: previewId },
    include: { importSession: true },
  });

  if (!preview || preview.importSession.userId !== user.id) {
    throw new Error("Transação não encontrada ou não pertence ao usuário");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedPreview = await tx.importTransactionPreview.update({
      where: { id: previewId },
      data: {
        status: novoStatus,
        resolved: !["PENDING", "NEW"].includes(novoStatus),
      },
    });

    if (novoStatus === "CONFIRMED") {
      const txData = updatedPreview.data as any;

      // Converter valor para centavos
      const cleanedValue = txData.VALOR.replace(/[^\d,-]/g, "").replace(
        ",",
        "."
      );
      const amount = Math.round(parseFloat(cleanedValue) * 100);

      // Converter data
      const [day, month, year] = txData.DATA.split("/").map(Number);
      const date = new Date(year, month - 1, day);

      // Criar/obter categoria
      let category = await tx.category.findFirst({
        where: {
          name: txData.CATEGORIA || "Sem Categoria",
          userId: user.id,
        },
      });

      if (!category) {
        category = await tx.category.create({
          data: {
            name: txData.CATEGORIA || "Sem Categoria",
            userId: user.id,
          },
        });
      }

      // Criar operação principal
      await tx.operation.create({
        data: {
          userId: user.id,
          date,
          description: txData.DESCRIÇÃO,
          amount,
          type: amount >= 0 ? "INCOME" : "EXPENSE",
          categoryId: category.id,
          importSessionId: preview.importSessionId,
        },
      });

      // Atualizar contagem na sessão de importação
      await tx.importSession.update({
        where: { id: preview.importSessionId },
        data: {
          importedCount: { increment: 1 },
          ignoredCount: { decrement: 1 },
        },
      });
    }

    return updatedPreview;
  });

  revalidatePath(`/importacoes/${preview.importSessionId}`);
  return updated;
}
