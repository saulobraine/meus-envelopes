import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export async function deleteTransaction(id: string) {
  const { user } = await getAuthenticatedUser();

  const sharedAccounts = await prisma.sharedAccountAccess.findMany({
    where: { memberId: user.id },
    select: { ownerId: true },
  });
  const accessibleUserIds = [
    user.id,
    ...sharedAccounts.map((sa: any) => sa.ownerId),
  ];

  await prisma.transaction.delete({
    where: { id, userId: { in: accessibleUserIds } },
  });

  revalidatePath("/dashboard");
}