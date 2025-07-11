'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const monthlyIncomeSchema = z.object({
  fixed: z.number().int().nonnegative(),
  variable: z.number().int().nonnegative().optional().default(0),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
})

const budgetEnvelopeSchema = z.object({
  name: z.string().min(1),
  allocation: z.number().int().min(0).max(100),
})

const categoryBudgetSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.number().int().nonnegative().optional(),
  percentage: z.number().min(0).max(100).optional(),
  envelopeId: z.string().optional(),
}).refine(data => (data.amount !== undefined && data.percentage === undefined) || (data.amount === undefined && data.percentage !== undefined), {
  message: "Either amount or percentage must be provided, but not both.",
})

export async function createMonthlyIncome(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const fixedStr = formData.get('fixed') as string || '0'
  const variableStr = formData.get('variable') as string || '0'

  const parsed = monthlyIncomeSchema.parse({
    fixed: Math.round(parseFloat(fixedStr) * 100),
    variable: Math.round(parseFloat(variableStr) * 100),
    month: parseInt(formData.get('month') as string),
    year: parseInt(formData.get('year') as string),
  })

  await prisma.monthlyIncome.upsert({
    where: { userId_month_year: { userId: user.id, month: parsed.month, year: parsed.year } },
    update: parsed,
    create: { ...parsed, userId: user.id },
  })

  revalidatePath('/planning')
}

export async function createBudgetEnvelope(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const parsed = budgetEnvelopeSchema.parse({
    name: formData.get('name') as string,
    allocation: parseInt(formData.get('allocation') as string),
  })

  await prisma.budgetEnvelope.create({
    data: { ...parsed, userId: user.id },
  })

  revalidatePath('/planning')
}

export async function deleteBudgetEnvelope(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const sharedAccounts = await prisma.sharedAccountAccess.findMany({
    where: { memberId: user.id },
    select: { ownerId: true },
  })
  const accessibleUserIds = [user.id, ...sharedAccounts.map(sa => sa.ownerId)]

  await prisma.budgetEnvelope.delete({
    where: { id, userId: { in: accessibleUserIds } },
  })

  revalidatePath('/planning')
}

export async function createCategoryBudget(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const parsed = categoryBudgetSchema.parse({
    categoryId: formData.get('categoryId') as string,
    amount: formData.get('amount') ? Math.round(parseFloat(formData.get('amount') as string) * 100) : undefined,
    percentage: formData.get('percentage') ? parseInt(formData.get('percentage') as string) : undefined,
    envelopeId: formData.get('envelopeId') as string,
  })

  await prisma.categoryBudget.upsert({
    where: { categoryId: parsed.categoryId },
    update: { ...parsed, userId: user.id },
    create: { ...parsed, userId: user.id },
  })

  revalidatePath('/planning')
}

export async function deleteCategoryBudget(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const sharedAccounts = await prisma.sharedAccountAccess.findMany({
    where: { memberId: user.id },
    select: { ownerId: true },
  })
  const accessibleUserIds = [user.id, ...sharedAccounts.map(sa => sa.ownerId)]

  await prisma.categoryBudget.delete({
    where: { id, userId: { in: accessibleUserIds } },
  })

  revalidatePath('/planning')
}
