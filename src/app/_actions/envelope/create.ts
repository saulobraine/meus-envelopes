"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const envelopeSchema = z.object({
  name: z.string().min(1),
  value: z.coerce.number(),
  type: z.enum(["PERCENTAGE", "MONETARY"]),
});

export async function create(formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const parsed = envelopeSchema.parse({
    name: formData.get("name") as string,
    value: formData.get("value") as string,
    type: formData.get("type") as string,
  });

  const existingEnvelope = await prisma.envelope.findFirst({
    where: {
      name: parsed.name,
      userId: user.id,
    },
  });

  if (existingEnvelope) {
    throw new Error("Já existe um envelope com este nome.");
  }

  await prisma.envelope.create({
    data: {
      ...parsed,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
}