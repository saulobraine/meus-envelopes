"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export async function get() {
  const { user } = await getAuthenticatedUser();

  const envelopes = await prisma.envelope.findMany({
    where: {
      OR: [{ userId: user.id }, { isGlobal: true }],
    },
    orderBy: { name: "asc" },
  });

  return envelopes;
}