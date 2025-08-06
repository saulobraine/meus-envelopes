"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export async function get() {
  const { user } = await getAuthenticatedUser();

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
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
