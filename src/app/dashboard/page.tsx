import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { createOperation, deleteOperation } from "@/app/_actions/operation";
import { createCategory, deleteCategory } from "@/app/_actions/category";
import { getCalculatedBudgets } from "@/app/planejamento/page";
import { revalidatePath } from "next/cache";
import { formatCurrency } from "@/lib/currency";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { H1, P } from "@/components/ui/typography";

async function getUser() {
  "use server";
  const supabase = await createClient();
  return await (await supabase).auth.getUser();
}

export default async function DashboardPage() {
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    return <p>Por favor, faça login para ver seu painel.</p>;
  }

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const operations = await prisma.operation.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { date: "desc" },
  });

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  const income = operations
    .filter((op) => op.type === "INCOME")
    .reduce((sum, op) => sum + op.amount, 0);

  const expense = operations
    .filter((op) => op.type === "EXPENSE")
    .reduce((sum, op) => sum + op.amount, 0);

  const calculatedBudgets = await getCalculatedBudgets(
    user.id,
    currentMonth,
    currentYear
  );

  const categoryExpenses = operations
    .filter((op) => op.type === "EXPENSE" && op.categoryId)
    .reduce(
      (acc, op) => {
        acc[op.categoryId!] = (acc[op.categoryId!] || 0) + op.amount;
        return acc;
      },
      {} as Record<string, number>
    );

  return (
    <div className="container mx-auto p-4">
      <H1 className="mb-4">Painel</H1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <P>Receita Total: {formatCurrency(income)}</P>
            <P>Despesa Total: {formatCurrency(expense)}</P>
            <P>Saldo: {formatCurrency(income - expense)}</P>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gráficos (Em Breve)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded">
              <p>Gráficos serão exibidos aqui</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Progresso Orçamentário</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {calculatedBudgets.map(
              (cb: {
                id: string;
                categoryId: string;
                budgetedAmount: number;
                category: { name: string };
              }) => {
                const spent = categoryExpenses[cb.categoryId] || 0;
                return (
                  <li
                    key={cb.id}
                    className="py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    <span>
                      {cb.category.name}: Gastos {formatCurrency(spent)} de{" "}
                      {formatCurrency(cb.budgetedAmount)}
                    </span>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width: `${(spent / cb.budgetedAmount) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </li>
                );
              }
            )}
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Nova Operação</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData) => {
                "use server";
                await createOperation(formData);
                revalidatePath("/painel");
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="amount">Valor</Label>
                <Input
                  type="number"
                  step="0.01"
                  name="amount"
                  id="amount"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Receita</SelectItem>
                    <SelectItem value="EXPENSE">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input type="text" name="description" id="description" />
              </div>
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  type="date"
                  name="date"
                  id="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoryId">Categoria</Label>
                <Select name="categoryId">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar Categoria (Opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Adicionar Operação</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData) => {
                "use server";
                await createCategory(formData);
                revalidatePath("/painel");
              }}
              className="flex space-x-2 mb-4"
            >
              <Input
                type="text"
                name="name"
                placeholder="Nome da Categoria"
                required
              />
              <Button type="submit">Adicionar Categoria</Button>
            </form>
            <ul>
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <span>{category.name}</span>
                  <form
                    action={async () => {
                      "use server";
                      await deleteCategory(category.id);
                      revalidatePath("/painel");
                    }}
                  >
                    <Button type="submit" variant="destructive" size="sm">
                      Excluir
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operações</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {operations.map((operation) => (
              <li
                key={operation.id}
                className="py-4 flex justify-between items-center"
              >
                <div>
                  <P className="text-lg font-semibold">
                    {operation.description || "Sem Descrição"}
                  </P>
                  <P
                    className={`text-sm ${operation.type === "INCOME" ? "text-green-600" : "text-red-600"}`}
                  >
                    {operation.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(operation.amount)}
                  </P>
                  {operation.category && (
                    <P className="text-xs text-gray-500 dark:text-gray-400">
                      Categoria: {operation.category.name}
                    </P>
                  )}
                  <P className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(operation.date).toLocaleDateString()}
                  </P>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await deleteOperation(operation.id);
                    revalidatePath("/painel");
                  }}
                >
                  <Button type="submit" variant="destructive" size="sm">
                    Excluir
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
