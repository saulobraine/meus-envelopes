"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { parseCurrency } from "@/lib/currency";
import { TransactionType } from "@prisma/client";
import { getOrCreateDefaultEnvelope } from "@/lib/envelope";

const transactionSchema = z.object({
  amount: z.number().int().positive(),
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().optional(),
  date: z.coerce.date(),
  envelopeId: z
    .string()
    .optional()
    .nullable()
    .or(z.undefined())
    .or(z.literal(""))
    .or(z.literal("null"))
    .or(z.literal("undefined"))
    .or(z.literal("0")),
});

export async function update(id: string, formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const dateString = formData.get("date") as string;
  const envelopeIdFromForm = formData.get("envelopeId") as string | null;

  const parsed = transactionSchema.parse({
    amount: parseCurrency(formData.get("amount") as string),
    type: formData.get("type") as TransactionType,
    description: formData.get("description") as string,
    date: new Date(dateString).toISOString(),
    envelopeId:
      envelopeIdFromForm === "" ||
      envelopeIdFromForm === "null" ||
      envelopeIdFromForm === "undefined" ||
      envelopeIdFromForm === "0"
        ? undefined
        : envelopeIdFromForm,
  });

  // Ensure we have a valid envelope ID
  let envelopeId = parsed.envelopeId;
  if (
    !envelopeId ||
    envelopeId.trim() === "" ||
    envelopeId === "null" ||
    envelopeId === "undefined" ||
    envelopeId === "0"
  ) {
    envelopeId = await getOrCreateDefaultEnvelope();
  }

  await prisma.transaction.update({
    where: { id, userId: { in: [user.id] } },
    data: {
      amount: parsed.amount,
      type: parsed.type,
      description: parsed.description ?? "",
      date: parsed.date,
      envelopeId,
    },
  });

  revalidatePath("/dashboard");
}
