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

export async function update(id: string, formData: FormData) {
  const { user } = await getAuthenticatedUser();

  const parsed = envelopeSchema.parse({
    name: formData.get("name") as string,
    value: formData.get("value") as string,
    type: formData.get("type") as string,
  });

  await prisma.envelope.update({
    where: { id, userId: { in: [user.id] } },
    data: parsed,
  });

  revalidatePath("/dashboard");
}
