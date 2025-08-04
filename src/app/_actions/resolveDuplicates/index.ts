"use server";

import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { z } from "zod";

const resolveSchema = z.object({
  previewId: z.string(),
  action: z.enum(["ADD", "IGNORE"]),
});

export async function resolverDuplicata(input: unknown) {
  const { user } = await getAuthenticatedUser();

  const { previewId, action } = resolveSchema.parse(input);

  const previewItem = await prisma.importTransactionPreview.findUnique({
    where: { id: previewId },
    include: { importSession: true },
  });

  if (!previewItem || previewItem.importSession.userId !== user.id) {
    throw new Error("Item não encontrado ou não autorizado");
  }

  if (action === "IGNORE") {
    await prisma.importTransactionPreview.update({
      where: { id: previewId },
      data: { resolved: true },
    });
  } else if (action === "ADD") {
    const tx = previewItem.data as any;
    const amount = Math.round(
      parseFloat(tx.VALOR.replace(".", "").replace(",", ".")) * 100
    );
    const [day, month, year] = tx.DATA.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    let envelope = await prisma.envelope.findFirst({
      where: { name: tx.ENVELOPE, userId: user.id },
    });
    if (!envelope) {
      envelope = await prisma.envelope.create({
        data: {
          name: tx.ENVELOPE || "Sem Envelope",
          userId: user.id,
          value: 0,
          type: "MONETARY",
          isDeletable: true,
        },
      });
    }

    await prisma.transaction.create({
      data: {
        userId: user.id,
        date,
        description: tx.DESCRIÇÃO,
        amount,
        type: amount >= 0 ? "INCOME" : "EXPENSE",
        envelopeId: envelope.id,
        importSessionId: previewItem.importSessionId,
      },
    });

    await prisma.importTransactionPreview.update({
      where: { id: previewId },
      data: { resolved: true },
    });
  }

  return { success: true };
}
