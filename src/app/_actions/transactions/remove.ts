"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export async function remove(id: string) {
  const { user } = await getAuthenticatedUser();
  await prisma.transaction.delete({
    where: { id, userId: { in: [user.id] } },
  });

  revalidatePath("/dashboard");
}
