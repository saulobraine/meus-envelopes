import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const categorySchema = z.object({
  name: z.string().min(1),
});

export async function createCategory(formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const parsed = categorySchema.parse({
    name: formData.get("name") as string,
  });

  await prisma.category.create({
    data: {
      ...parsed,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
}

export async function updateCategory(id: string, formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const parsed = categorySchema.parse({
    name: formData.get("name") as string,
  });

  const sharedAccounts = await prisma.sharedAccountAccess.findMany({
    where: { memberId: user.id },
    select: { ownerId: true },
  });
  const accessibleUserIds = [
    user.id,
    ...sharedAccounts.map((sa) => sa.ownerId),
  ];

  await prisma.category.update({
    where: { id, userId: { in: accessibleUserIds } },
    data: parsed,
  });

  revalidatePath("/dashboard");
}

export async function deleteCategory(id: string) {
  const { user } = await getAuthenticatedUser();

  const sharedAccounts = await prisma.sharedAccountAccess.findMany({
    where: { memberId: user.id },
    select: { ownerId: true },
  });
  const accessibleUserIds = [
    user.id,
    ...sharedAccounts.map((sa) => sa.ownerId),
  ];

  await prisma.category.delete({
    where: { id, userId: { in: accessibleUserIds } },
  });

  revalidatePath("/dashboard");
}
