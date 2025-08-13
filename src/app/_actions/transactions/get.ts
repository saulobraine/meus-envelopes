"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { getOrCreateDefaultEnvelope } from "@/lib/envelope";

async function fixInvalidEnvelopeReferences(userId: string) {
  // Get all valid envelope IDs for this user
  const validEnvelopes = await prisma.envelope.findMany({
    where: {
      OR: [{ userId }, { isGlobal: true }],
    },
    select: { id: true },
  });

  const validEnvelopeIds = validEnvelopes.map((e) => e.id);

  // Find transactions with invalid envelope references
  const invalidTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      OR: [{ envelopeId: { notIn: validEnvelopeIds } }, { envelopeId: "" }],
    },
  });

  if (invalidTransactions.length > 0) {
    const defaultEnvelopeId = await getOrCreateDefaultEnvelope();

    // Update all invalid transactions to use the default envelope
    await prisma.transaction.updateMany({
      where: {
        id: { in: invalidTransactions.map((t) => t.id) },
      },
      data: {
        envelopeId: defaultEnvelopeId,
      },
    });
  }
}

export async function get() {
  const { user } = await getAuthenticatedUser();

  // Fix any invalid envelope references first
  await fixInvalidEnvelopeReferences(user.id);

  // First, get all valid envelope IDs for this user
  const validEnvelopes = await prisma.envelope.findMany({
    where: {
      OR: [{ userId: user.id }, { isGlobal: true }],
    },
    select: { id: true },
  });

  const validEnvelopeIds = validEnvelopes.map((e) => e.id);

  // Then get transactions that only reference valid envelopes
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      envelopeId: {
        in: validEnvelopeIds,
      },
    },
    include: {
      envelope: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return transactions;
}
