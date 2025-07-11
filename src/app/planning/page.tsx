import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { BudgetEnvelope, Category, CategoryBudget, MonthlyIncome, Operation } from '@prisma/client'
import { z } from 'zod'
import PlanningCharts from '@/components/planning-charts'

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

async function getUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return { data: { user: null } }
  }
  return { data }
}

export async function createMonthlyIncome(formData: FormData) {
  'use server'
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
  'use server'
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
  'use server'
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
  'use server'
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
  'use server'
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

export default async function PlanningPage() {
  const {
    data: { user },
  } = await getUser()

  if (!user) {
    return <p>Por favor, faça login para ver seu planejamento.</p>
  }

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const [
    monthlyIncome,
    budgetEnvelopes,
    categories,
    categoryBudgets,
    operations,
  ] = await Promise.all([
    prisma.monthlyIncome.findUnique({
      where: {
        userId_month_year: {
          userId: user.id,
          month: currentMonth,
          year: currentYear,
        },
      },
    }),
    prisma.budgetEnvelope.findMany({
      where: { userId: user.id },
    }),
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
    }),
    prisma.categoryBudget.findMany({
      where: { userId: user.id },
      include: { category: true, envelope: true },
    }),
    prisma.operation.findMany({
      where: {
        userId: user.id,
        type: 'EXPENSE',
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1),
        },
      },
      include: { category: true },
    }),
  ])

  const calculatedBudgets = await getCalculatedBudgets(
    user.id,
    currentMonth,
    currentYear,
  )

  const spendingByCategory = operations.reduce(
    (acc, op) => {
      if (op.categoryId) {
        acc[op.categoryId] = (acc[op.categoryId] || 0) + op.amount
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = calculatedBudgets.map((cb) => ({
    name: cb.category.name,
    budgeted: cb.budgetedAmount / 100,
    spent: (spendingByCategory[cb.categoryId] || 0) / 100,
  }))

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Planejamento</h1>

      <PlanningCharts data={chartData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Renda Mensal</h2>
          <form action={createMonthlyIncome} className="space-y-4">
            <div>
              <label
                htmlFor="fixed"
                className="block text-sm font-medium text-gray-700"
              >
                Renda Fixa
              </label>
              <input
                type="number"
                step="0.01"
                name="fixed"
                id="fixed"
                defaultValue={(monthlyIncome?.fixed || 0) / 100}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="variable"
                className="block text-sm font-medium text-gray-700"
              >
                Renda Variável
              </label>
              <input
                type="number"
                step="0.01"
                name="variable"
                id="variable"
                defaultValue={(monthlyIncome?.variable || 0) / 100}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="month"
                className="block text-sm font-medium text-gray-700"
              >
                Mês
              </label>
              <input
                type="number"
                name="month"
                id="month"
                defaultValue={currentMonth}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700"
              >
                Ano
              </label>
              <input
                type="number"
                name="year"
                id="year"
                defaultValue={currentYear}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Salvar Renda
            </button>
          </form>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">
            Envelopes Orçamentários
          </h2>
          <form action={createBudgetEnvelope} className="space-y-4 mb-4">
            <div>
              <label
                htmlFor="envelopeName"
                className="block text-sm font-medium text-gray-700"
              >
                Nome do Envelope
              </label>
              <input
                type="text"
                name="name"
                id="envelopeName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="allocation"
                className="block text-sm font-medium text-gray-700"
              >
                Alocação (%)
              </label>
              <input
                type="number"
                step="1"
                name="allocation"
                id="allocation"
                min="0"
                max="100"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Adicionar Envelope
            </button>
          </form>
          <ul>
            {budgetEnvelopes.map((envelope: BudgetEnvelope) => (
              <li
                key={envelope.id}
                className="flex justify-between items-center py-2 border-b last:border-b-0"
              >
                <span>
                  {envelope.name} ({envelope.allocation}%)
                </span>
                <form action={async () => {
                  'use server'
                  await deleteBudgetEnvelope(envelope.id)
                }}>
                  <button type="submit" className="text-red-600 hover:text-red-900 text-sm">Excluir</button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Orçamentos por Categoria
        </h2>
        <form action={createCategoryBudget} className="space-y-4 mb-4">
          <div>
            <label
              htmlFor="categoryBudgetCategory"
              className="block text-sm font-medium text-gray-700"
            >
              Categoria
            </label>
            <select
              name="categoryId"
              id="categoryBudgetCategory"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Selecionar Categoria</option>
              {categories.map((category: Category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="budgetType"
              className="block text-sm font-medium text-gray-700"
            >
              Tipo de Orçamento
            </label>
            <select
              id="budgetType"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="fixed">Valor Fixo</option>
              <option value="percentage">Percentual do Envelope</option>
            </select>
          </div>
          <div id="fixedAmountDiv">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Valor
            </label>
            <input
              type="number"
              step="0.01"
              name="amount"
              id="amount"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div id="percentageDiv" style={{ display: 'none' }}>
            <label
              htmlFor="percentage"
              className="block text-sm font-medium text-gray-700"
            >
              Percentual (%)
            </label>
            <input
              type="number"
              step="1"
              name="percentage"
              id="percentage"
              min="0"
              max="100"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            <label
              htmlFor="envelopeId"
              className="block text-sm font-medium text-gray-700"
            >
              Do Envelope
            </label>
            <select
              name="envelopeId"
              id="envelopeId"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Selecionar Envelope</option>
              {budgetEnvelopes.map((envelope: BudgetEnvelope) => (
                <option key={envelope.id} value={envelope.id}>
                  {envelope.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Adicionar Orçamento
          </button>
        </form>
        <ul>
          {categoryBudgets.map(
            (
              cb: CategoryBudget & {
                category: Category
                envelope: BudgetEnvelope | null
              },
            ) => (
              <li
                key={cb.id}
                className="flex justify-between items-center py-2 border-b last:border-b-0"
              >
                <span>
                  {cb.category.name}:{' '}
                  {cb.amount
                    ? `R$ ${(cb.amount / 100).toFixed(2)}`
                    : `${cb.percentage || '0'}% de ${cb.envelope?.name || 'N/A'}`}
                </span>
                <form action={async () => {
                  'use server'
                  await deleteCategoryBudget(cb.id)
                }}>
                  <button type="submit" className="text-red-600 hover:text-red-900 text-sm">Excluir</button>
                </form>
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  )
}

export async function getCalculatedBudgets(userId: string, month: number, year: number) {
  const monthlyIncome = await prisma.monthlyIncome.findUnique({
    where: { userId_month_year: { userId, month, year } },
  })

  if (!monthlyIncome) {
    return []
  }

  const totalIncome = monthlyIncome.fixed + monthlyIncome.variable

  const budgetEnvelopes = await prisma.budgetEnvelope.findMany({
    where: { userId },
  })

  const categoryBudgets = await prisma.categoryBudget.findMany({
    where: { userId },
    include: { category: true, envelope: true },
  })

  const calculatedBudgets = categoryBudgets.map(cb => {
    let budgetedAmount = 0
    if (cb.amount !== null && cb.amount !== undefined) {
      budgetedAmount = cb.amount
    } else if (cb.percentage !== null && cb.percentage !== undefined && cb.envelope) {
      const envelopeAllocation = budgetEnvelopes.find(e => e.id === cb.envelopeId)?.allocation || 0
      budgetedAmount = totalIncome * (envelopeAllocation / 100) * (cb.percentage / 100)
    }
    return { ...cb, budgetedAmount }
  })

  return calculatedBudgets
}
