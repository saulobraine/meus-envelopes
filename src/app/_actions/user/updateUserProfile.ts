"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(formData: FormData) {
  const name = formData.get("name") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    data: { name },
  });

  if (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }

  revalidatePath("/configuracoes");
}
