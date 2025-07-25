"use server";

import { getAuthenticatedUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUser(formData: FormData) {
  const name = formData.get("name") as string;

  const { client: supabase } = await getAuthenticatedUser();

  const { error } = await supabase.auth.updateUser({
    data: { name },
  });

  if (error) {
    throw new Error(`Erro ao atualizar o usuário: ${error.message}`);
  }

  revalidatePath("/settings");
}
