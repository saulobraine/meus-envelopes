"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export async function remove(id: string) {
  const { user } = await getAuthenticatedUser();

  const sharedAccounts = await prisma.sharedAccountAccess.findMany({
    where: { memberId: user.id },
    select: { ownerId: true },
  });
  const accessibleUserIds = [
    user.id,
    ...sharedAccounts.map((sa) => sa.ownerId),
  ];

  await prisma.envelope.delete({
    where: { id, userId: { in: accessibleUserIds }, isDeletable: true },
  });

  revalidatePath("/dashboard");
}