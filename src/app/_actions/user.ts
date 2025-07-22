'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUser(formData: FormData) {
  const name = formData.get('name') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado.')
  }

  const { error } = await supabase.auth.updateUser({
    data: { name },
  })

  if (error) {
    throw new Error(`Erro ao atualizar o usuário: ${error.message}`)
  }

  revalidatePath('/settings')
}
