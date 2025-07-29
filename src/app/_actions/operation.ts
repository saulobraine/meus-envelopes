import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { sendNewOperationEmail } from "./email";

const operationSchema = z.object({
  amount: z.number().int().positive(),
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().optional(),
  date: z.string().datetime(),
  envelopeId: z.string().optional(),
});

import { parseCurrency } from "@/lib/currency";

export async function createOperation(formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const dateString = formData.get("date") as string;
  const parsed = operationSchema.parse({
    amount: parseCurrency(formData.get("amount") as string),
    type: formData.get("type") as "INCOME" | "EXPENSE",
    description: formData.get("description") as string,
    date: new Date(dateString).toISOString(),
    envelopeId: formData.get("envelopeId") as string,
  });

  const newOperation = await prisma.operation.create({
    data: {
      amount: parsed.amount,
      type: parsed.type,
      date: parsed.date,
      description: parsed.description || "",
      envelopeId: parsed.envelopeId,
      userId: user.id,
    },
    include: { envelope: true },
  });

  if (user.email) {
    await sendNewOperationEmail({
      to: user.email,
      userName: user.user_metadata.full_name || user.email,
      amount: newOperation.amount,
      type: newOperation.type,
      description: newOperation.description || "",
      envelopeName: newOperation.envelope?.name || "",
    });
  }

  revalidatePath("/dashboard");
}

export async function updateOperation(id: string, formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const dateString = formData.get("date") as string;
  const parsed = operationSchema.parse({
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

  await prisma.operation.update({
    where: { id, userId: { in: accessibleUserIds } },
    data: parsed,
  });

  revalidatePath("/dashboard");
}

export async function deleteOperation(id: string) {
  const { user } = await getAuthenticatedUser();

  const sharedAccounts = await prisma.sharedAccountAccess.findMany({
    where: { memberId: user.id },
    select: { ownerId: true },
  });
  const accessibleUserIds = [
    user.id,
    ...sharedAccounts.map((sa) => sa.ownerId),
  ];

  await prisma.operation.delete({
    where: { id, userId: { in: accessibleUserIds } },
  });

  revalidatePath("/dashboard");
}
