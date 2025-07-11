import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { sendNewOperationEmail } from './email'

const operationSchema = z.object({
  amount: z.number().int().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().optional(),
  date: z.string().datetime(),
  categoryId: z.string().optional(),
})

export async function createOperation(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await (await supabase).auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const dateString = formData.get('date') as string;
  const parsed = operationSchema.parse({
    amount: Math.round(parseFloat(formData.get('amount') as string) * 100),
    type: formData.get('type') as 'INCOME' | 'EXPENSE',
    description: formData.get('description') as string,
    date: new Date(dateString).toISOString(),
    categoryId: formData.get('categoryId') as string,
  })

  const newOperation = await prisma.operation.create({
    data: {
      ...parsed,
      userId: user.id,
    },
    include: { category: true },
  })

  if (user.email) {
    await sendNewOperationEmail({
      to: user.email,
      userName: user.user_metadata.full_name || user.email,
      amount: newOperation.amount,
      type: newOperation.type,
      description: newOperation.description || '',
      categoryName: newOperation.category?.name || '',
    })
  }

  revalidatePath('/dashboard')
}

export async function updateOperation(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await (await supabase).auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const dateString = formData.get('date') as string;
  const parsed = operationSchema.parse({
    amount: Math.round(parseFloat(formData.get('amount') as string) * 100),
    type: formData.get('type') as 'INCOME' | 'EXPENSE',
    description: formData.get('description') as string,
    date: new Date(dateString).toISOString(),
    categoryId: formData.get('categoryId') as string,
  })

  const sharedAccounts = await prisma.sharedAccountAccess.findMany({
    where: { memberId: user.id },
    select: { ownerId: true },
  })
  const accessibleUserIds = [user.id, ...sharedAccounts.map(sa => sa.ownerId)]

  await prisma.operation.update({
    where: { id, userId: { in: accessibleUserIds } },
    data: parsed,
  })

  revalidatePath('/dashboard')
}

export async function deleteOperation(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await (await supabase).auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const sharedAccounts = await prisma.sharedAccountAccess.findMany({
    where: { memberId: user.id },
    select: { ownerId: true },
  })
  const accessibleUserIds = [user.id, ...sharedAccounts.map(sa => sa.ownerId)]

  await prisma.operation.delete({
    where: { id, userId: { in: accessibleUserIds } },
  })

  revalidatePath('/dashboard')
}
