import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { sendNewTransactionEmail } from "../email/sendNewTransactionEmail";

const transactionSchema = z.object({
  amount: z.number().int().positive(),
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().optional(),
  date: z.coerce.date(),
  envelopeId: z.string().optional(),
});

import { parseCurrency } from "@/lib/currency";

export async function createTransaction(formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const dateString = formData.get("date") as string;
  const parsed = transactionSchema.parse({
    amount: parseCurrency(formData.get("amount") as string),
    type: formData.get("type") as "INCOME" | "EXPENSE",
    description: formData.get("description") as string,
    date: new Date(dateString).toISOString(),
    envelopeId: formData.get("envelopeId") as string,
  });

  const newTransaction = await prisma.transaction.create({
    data: {
      amount: parsed.amount,
      type: parsed.type as "INCOME" | "EXPENSE",
      date: parsed.date,
      description: parsed.description ?? "",
      envelopeId: parsed.envelopeId ?? "",
      userId: user.id,
    },
    include: { envelope: true },
  });

  if (user.email) {
    await sendNewTransactionEmail({
      to: user.email,
      userName: user.user_metadata.full_name || user.email,
      amount: newTransaction.amount,
      type: newTransaction.type,
      description: newTransaction.description || "",
      envelopeName: newTransaction.envelope?.name || "",
    });
  }

  revalidatePath("/dashboard");
}

export async function updateTransaction(id: string, formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const dateString = formData.get("date") as string;
  const parsed = transactionSchema.parse({
    amount: parseCurrency(formData.get("amount") as string),
    type: formData.get("type") as "INCOME" | "EXPENSE",
    description: formData.get("description") as string,
    date: new Date(dateString).toISOString(),
    envelopeId: formData.get("envelopeId") as string,
  });

  const sharedAccounts = await prisma.sharedAccountAccess.findMany({
    where: { memberId: user.id },
    select: { ownerId: true },
  });
  const accessibleUserIds = [
    user.id,
    ...sharedAccounts.map((sa) => sa.ownerId),
  ];

  await prisma.transaction.update({
    where: { id, userId: { in: accessibleUserIds } },
    data: parsed,
  });

  revalidatePath("/dashboard");
}

export async function deleteTransaction(id: string) {
  const { user } = await getAuthenticatedUser();

  const sharedAccounts = await prisma.sharedAccountAccess.findMany({
    where: { memberId: user.id },
    select: { ownerId: true },
  });
  const accessibleUserIds = [
    user.id,
    ...sharedAccounts.map((sa) => sa.ownerId),
  ];

  await prisma.transaction.delete({
    where: { id, userId: { in: accessibleUserIds } },
  });

  revalidatePath("/dashboard");
}
