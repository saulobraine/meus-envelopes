"use server";

import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export async function exportarTransacoes(filters: {
  de?: Date;
  ate?: Date;
  status?: string;
}) {
  const { user } = await getAuthenticatedUser();

  const operations = await prisma.operation.findMany({
    where: {
      userId: user.id,
      date: {
        gte: filters.de,
        lte: filters.ate,
      },
      // status: filters.status, // Adicionar quando o campo status estiver no modelo
    },
    include: {
      category: true,
    },
  });

  const header = "DATA,DESCRICAO,VALOR,CATEGORIA,STATUS\n";
  const csv = operations
    .map((op) => {
      const amount = op.type === "EXPENSE" ? -op.amount : op.amount;
      return `${op.date.toISOString()},${op.description},${amount / 100},${op.category?.name},${op.status}`;
    })
    .join("\n");

  return header + csv;
}
