"use server";

import { getAuthenticatedUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";
import { getOrCreateDefaultEnvelope } from "@/lib/envelope";

interface ImportTransaction {
  DESCRIÇÃO: string;
  VALOR: string;
  DATA: string;
}

export async function importarTransacoes(transactions: ImportTransaction[]) {
  const { user } = await getAuthenticatedUser();

  const defaultEnvelopeId = await getOrCreateDefaultEnvelope();

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
        },
      });

      importedCount++;
    } catch {
      errorCount++;
    }
  }

  return {
    importedCount,
    ignoredCount: duplicateCount,
    errorCount,
  };
}
