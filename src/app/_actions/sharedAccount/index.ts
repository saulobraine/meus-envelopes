"use server";

import { getAuthenticatedUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email(),
});

export async function inviteUserToSharedAccount(formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const parsed = inviteSchema.parse({
    email: formData.get("email") as string,
  });

  const invitedUser = await prisma.user.findUnique({
    where: { email: parsed.email },
  });

  if (!invitedUser) {
    throw new Error("User with this email not found.");
  }

  if (invitedUser.id === user.id) {
    throw new Error("Cannot invite yourself.");
  }

  await prisma.sharedAccountAccess.create({
    data: {
      ownerId: user.id,
      memberId: invitedUser.id,
    },
  });

  revalidatePath("/shared-accounts");
}

export async function removeUserFromSharedAccount(id: string) {
  const { user } = await getAuthenticatedUser();

  await prisma.sharedAccountAccess.delete({
    where: { id, ownerId: user.id },
  });

  revalidatePath("/shared-accounts");
}
