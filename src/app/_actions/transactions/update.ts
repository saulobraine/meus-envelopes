import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { parseCurrency } from "@/lib/currency";
import { TransactionType } from "@prisma/client";

const transactionSchema = z.object({
  amount: z.number().int().positive(),
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().optional(),
  date: z.coerce.date(),
  envelopeId: z.string().optional(),
});

export async function updateTransaction(id: string, formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const dateString = formData.get("date") as string;
  const parsed = transactionSchema.parse({
    amount: parseCurrency(formData.get("amount") as string),
    type: formData.get("type") as TransactionType,
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
    ...sharedAccounts.map((sa: any) => sa.ownerId),
  ];

  await prisma.transaction.update({
    where: { id, userId: { in: accessibleUserIds } },
    data: parsed,
  });

  revalidatePath("/dashboard");
}