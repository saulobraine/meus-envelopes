import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { createOperation, deleteOperation } from '@/app/_actions/operation'
import { createCategory, deleteCategory } from '@/app/_actions/category'
import { getCalculatedBudgets } from '@/app/planning/page'
import { revalidatePath } from 'next/cache'
import { formatCurrency } from '@/lib/currency'

async function getUser() {
  'use server'
  const supabase = await createClient()
  return await (await supabase).auth.getUser()
}

export default async function DashboardPage() {
  const { data: { user } } = await getUser()

  if (!user) {
    return <p>Por favor, faça login para ver seu painel.</p>
  }

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const operations = await prisma.operation.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { date: 'desc' },
  })

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: 'asc' },
  })

  const income = operations
    .filter(op => op.type === 'INCOME')
    .reduce((sum, op) => sum + op.amount, 0)

  const expense = operations
    .filter(op => op.type === 'EXPENSE')
    .reduce((sum, op) => sum + op.amount, 0)

  const calculatedBudgets = await getCalculatedBudgets(user.id, currentMonth, currentYear)

  const categoryExpenses = operations
    .filter(op => op.type === 'EXPENSE' && op.categoryId)
    .reduce((acc, op) => {
      acc[op.categoryId!] = (acc[op.categoryId!] || 0) + op.amount
      return acc
    }, {} as Record<string, number>)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Painel</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Resumo</h2>
          <p>Receita Total: {formatCurrency(income)}</p>
          <p>Despesa Total: {formatCurrency(expense)}</p>
          <p>Saldo: {formatCurrency(income - expense)}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Gráficos (Em Breve)</h2>
          {/* Placeholder for Recharts */}
          <div className="h-48 bg-gray-100 flex items-center justify-center rounded">
            <p>Gráficos serão exibidos aqui</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-2">Progresso Orçamentário</h2>
        <ul>
          {calculatedBudgets.map(cb => {
            const spent = categoryExpenses[cb.categoryId] || 0
            return (
              <li key={cb.id} className="py-2 border-b last:border-b-0">
                <span>{cb.category.name}: Gastos {formatCurrency(spent)} de {formatCurrency(cb.budgetedAmount)}</span>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(spent / cb.budgetedAmount) * 100}%` }}></div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Nova Operação</h2>
          <form action={async (formData) => {
            'use server'
            await createOperation(formData)
            revalidatePath('/dashboard')
          }} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor</label>
              <input type="number" step="0.01" name="amount" id="amount" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
              <select name="type" id="type" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                <option value="INCOME">Receita</option>
                <option value="EXPENSE">Despesa</option>
              </select>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
              <input type="text" name="description" id="description" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data</label>
              <input type="date" name="date" id="date" defaultValue={new Date().toISOString().split('T')[0]} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Categoria</label>
              <select name="categoryId" id="categoryId" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                <option value="">Selecionar Categoria (Opcional)</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Adicionar Operação
            </button>
          </form>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Categorias</h2>
          <form action={async (formData) => {
            'use server'
            await createCategory(formData)
            revalidatePath('/dashboard')
          }} className="flex space-x-2 mb-4">
            <input type="text" name="name" placeholder="Nome da Categoria" required className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Adicionar Categoria
            </button>
          </form>
          <ul>
            {categories.map(category => (
              <li key={category.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <span>{category.name}</span>
                <form action={async () => {
                  'use server'
                  await deleteCategory(category.id)
                  revalidatePath('/dashboard')
                }}>
                  <button type="submit" className="text-red-600 hover:text-red-900 text-sm">Excluir</button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Operações</h2>
        <ul className="divide-y divide-gray-200">
          {operations.map(operation => (
            <li key={operation.id} className="py-4 flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">{operation.description || 'Sem Descrição'}</p>
                <p className={`text-sm ${operation.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                  {operation.type === 'INCOME' ? '+' : '-'}{formatCurrency(operation.amount)}
                </p>
                {operation.category && (
                  <p className="text-xs text-gray-500">Categoria: {operation.category.name}</p>
                )}
                <p className="text-xs text-gray-500">{new Date(operation.date).toLocaleDateString()}</p>
              </div>
              <form action={async () => {
                'use server'
                await deleteOperation(operation.id)
                revalidatePath('/dashboard')
              }}>
                <button type="submit" className="text-red-600 hover:text-red-900 text-sm">Excluir</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
