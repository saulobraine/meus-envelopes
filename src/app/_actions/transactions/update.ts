"use server";

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

export async function update(id: string, formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const dateString = formData.get("date") as string;
  const parsed = transactionSchema.parse({
    amount: parseCurrency(formData.get("amount") as string),
    type: formData.get("type") as TransactionType,
    description: formData.get("description") as string,
    date: new Date(dateString).toISOString(),
    envelopeId: formData.get("envelopeId") as string,
  });

  await prisma.transaction.update({
    where: { id, userId: { in: [user.id] } },
    data: parsed,
  });

  revalidatePath("/dashboard");
}
