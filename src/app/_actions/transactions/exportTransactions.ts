"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export async function exportarTransacoes(filters: {
  de?: Date;
  ate?: Date;
  status?: string;
}) {
  const { user } = await getAuthenticatedUser();

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: {
        gte: filters.de,
        lte: filters.ate,
      },
      // status: filters.status, // Adicionar quando o campo status estiver no modelo
    },
    include: {
      envelope: true,
    },
  });

  const header = "DATA,DESCRICAO,VALOR,ENVELOPE,STATUS\n";
  const csv = transactions
    .map((op) => {
      const amount = op.type === "EXPENSE" ? -op.amount : op.amount;
      return `${op.date.toISOString()},${op.description},${amount / 100},${op.envelope?.name},${op.status}`;
    })
    .join("\n");

  return header + csv;
}
