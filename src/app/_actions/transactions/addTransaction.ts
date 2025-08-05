"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { TransactionType } from "@prisma/client";

export async function addTransaction(data: {
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}) {
  const { user } = await getAuthenticatedUser();

  await prisma.transaction.create({
    data: {
      userId: user.id,
      description: data.description,
      amount: data.amount,
      type:
        data.type === TransactionType.EXPENSE
          ? TransactionType.EXPENSE
          : TransactionType.INCOME,
      envelopeId: data.category,
      date: new Date(),
    },
  });
}