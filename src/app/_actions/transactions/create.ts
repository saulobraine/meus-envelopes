"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { sendNewTransactionEmail } from "../email/sendNewTransactionEmail";
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

export async function create(formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const dateString = formData.get("date") as string;
  const envelopeIdFromForm = formData.get("envelopeId") as string | null;

  const parsed = transactionSchema.parse({
    amount: parseCurrency(formData.get("amount") as string),
    type: formData.get("type") as "INCOME" | "EXPENSE",
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

  const newTransaction = await prisma.transaction.create({
    data: {
      amount: parsed.amount,
      type: parsed.type as TransactionType,
      date: parsed.date,
      description: parsed.description ?? "",
      envelopeId,
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

  return newTransaction;
}
