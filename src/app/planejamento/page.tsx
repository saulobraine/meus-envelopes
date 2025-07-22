import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { BudgetEnvelope, Category, CategoryBudget } from "@prisma/client";
import { z } from "zod";
import PlanningCharts from "@/components/planning-charts";
import { formatCurrency } from "@/lib/currency";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const monthlyIncomeSchema = z.object({
  fixed: z.number().int().nonnegative(),
  variable: z.number().int().nonnegative().optional().default(0),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
});

const budgetEnvelopeSchema = z.object({
  name: z.string().min(1),
  allocation: z.number().int().min(0).max(100),
});

const categoryBudgetSchema = z
  .object({
    categoryId: z.string().min(1),
    amount: z.number().int().nonnegative().optional(),
    percentage: z.number().min(0).max(100).optional(),
    envelopeId: z.string().optional(),
  })
  .refine(
    (data) =>
      (data.amount !== undefined && data.percentage === undefined) ||
      (data.amount === undefined && data.percentage !== undefined),
    {
      message: "Either amount or percentage must be provided, but not both.",
    }
  );

async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting user:", error);
    return { data: { user: null } };
  }
  return { data };
}

import { parseCurrency } from "@/lib/currency";
import { Input } from "@/components/ui/input";

export async function createMonthlyIncome(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const fixedStr = (formData.get("fixed") as string) || "0";
  const variableStr = (formData.get("variable") as string) || "0";

  const parsed = monthlyIncomeSchema.parse({
    fixed: parseCurrency(fixedStr),
    variable: parseCurrency(variableStr),
    month: parseInt(formData.get("month") as string),
    year: parseInt(formData.get("year") as string),
  });

  await prisma.monthlyIncome.upsert({
    where: {
      userId_month_year: {
        userId: user.id,
        month: parsed.month,
        year: parsed.year,
      },
    },
    update: parsed,
    create: { ...parsed, userId: user.id },
  });

  revalidatePath("/planning");
}

export async function createBudgetEnvelope(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const parsed = budgetEnvelopeSchema.parse({
    name: formData.get("name") as string,
    allocation: parseInt(formData.get("allocation") as string),
  });

  await prisma.budgetEnvelope.create({
    data: { ...parsed, userId: user.id },
  });

  revalidatePath("/planning");
}

export async function deleteBudgetEnvelope(id: string) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const sharedAccounts = await prisma.sharedAccountAccess.findMany({
    where: { memberId: user.id },
    select: { ownerId: true },
  });
  const accessibleUserIds = [
    user.id,
    ...sharedAccounts.map((sa) => sa.ownerId),
  ];

  await prisma.budgetEnvelope.delete({
    where: { id, userId: { in: accessibleUserIds } },
  });

  revalidatePath("/planning");
}

export async function createCategoryBudget(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const parsed = categoryBudgetSchema.parse({
    categoryId: formData.get("categoryId") as string,
    amount: formData.get("amount")
      ? parseCurrency(formData.get("amount") as string)
      : undefined,
    percentage: formData.get("percentage")
      ? parseInt(formData.get("percentage") as string)
      : undefined,
    envelopeId: formData.get("envelopeId") as string,
  });

  await prisma.categoryBudget.upsert({
    where: { categoryId: parsed.categoryId },
    update: { ...parsed, userId: user.id },
    create: { ...parsed, userId: user.id },
  });

  revalidatePath("/planning");
}

export async function deleteCategoryBudget(id: string) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const sharedAccounts = await prisma.sharedAccountAccess.findMany({
    where: { memberId: user.id },
    select: { ownerId: true },
  });
  const accessibleUserIds = [
    user.id,
    ...sharedAccounts.map((sa) => sa.ownerId),
  ];

  await prisma.categoryBudget.delete({
    where: { id, userId: { in: accessibleUserIds } },
  });

  revalidatePath("/planning");
}

export default async function PlanningPage() {
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    return <p>Por favor, faça login para ver seu planejamento.</p>;
  }

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

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
      orderBy: { name: "asc" },
    }),
    prisma.categoryBudget.findMany({
      where: { userId: user.id },
      include: { category: true, envelope: true },
    }),
    prisma.operation.findMany({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1),
        },
      },
      include: { category: true },
    }),
  ]);

  const calculatedBudgets = await getCalculatedBudgets(
    user.id,
    currentMonth,
    currentYear
  );

  const spendingByCategory = operations.reduce(
    (acc, op) => {
      if (op.categoryId) {
        acc[op.categoryId] = (acc[op.categoryId] || 0) + op.amount;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const chartData = calculatedBudgets.map((cb: CategoryBudget & { category: Category; envelope: BudgetEnvelope | null; budgetedAmount: number; }) => ({
    name: cb.category.name,
    budgeted: cb.budgetedAmount / 100,
    spent: (spendingByCategory[cb.categoryId] || 0) / 100,
  }));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Planejamento</h1>

      <PlanningCharts data={chartData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Renda Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createMonthlyIncome} className="space-y-4">
              <div>
                <Label htmlFor="fixed">Renda Fixa</Label>
                <CurrencyInput
                  name="fixed"
                  id="fixed"
                  defaultValue={formatCurrency(monthlyIncome?.fixed || 0)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="variable">Renda Variável</Label>
                <CurrencyInput
                  name="variable"
                  id="variable"
                  defaultValue={formatCurrency(monthlyIncome?.variable || 0)}
                />
              </div>
              <div>
                <Label htmlFor="month">Mês</Label>
                <Input
                  type="number"
                  name="month"
                  id="month"
                  defaultValue={currentMonth}
                  required
                />
              </div>
              <div>
                <Label htmlFor="year">Ano</Label>
                <Input
                  type="number"
                  name="year"
                  id="year"
                  defaultValue={currentYear}
                  required
                />
              </div>
              <Button type="submit">Salvar Renda</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Envelopes Orçamentários</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createBudgetEnvelope} className="space-y-4 mb-4">
              <div>
                <Label htmlFor="envelopeName">Nome do Envelope</Label>
                <Input type="text" name="name" id="envelopeName" required />
              </div>
              <div>
                <Label htmlFor="allocation">Alocação (%)</Label>
                <Input
                  type="number"
                  step="1"
                  name="allocation"
                  id="allocation"
                  min="0"
                  max="100"
                  required
                />
              </div>
              <Button type="submit">Adicionar Envelope</Button>
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
                  <form
                    action={async () => {
                      "use server";
                      await deleteBudgetEnvelope(envelope.id);
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

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Orçamentos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCategoryBudget} className="space-y-4 mb-4">
              <div>
                <label
                  htmlFor="categoryBudgetCategory"
                  className="block text-sm font-medium text-gray-700"
                >
                  Categoria
                </label>
                <Select name="categoryId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: Category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label
                  htmlFor="budgetType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tipo de Orçamento
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Orçamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Valor Fixo</SelectItem>
                    <SelectItem value="percentage">
                      Percentual do Envelope
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div id="fixedAmountDiv">
                <Label htmlFor="amount">Valor</Label>
                <CurrencyInput name="amount" id="amount" />
              </div>
              <div id="percentageDiv" style={{ display: "none" }}>
                <Label htmlFor="percentage">Percentual (%)</Label>
                <Input
                  type="number"
                  step="1"
                  name="percentage"
                  id="percentage"
                  min="0"
                  max="100"
                />
                <Label htmlFor="envelopeId">Do Envelope</Label>
                <Select name="envelopeId">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar Envelope" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetEnvelopes.map((envelope: BudgetEnvelope) => (
                      <SelectItem key={envelope.id} value={envelope.id}>
                        {envelope.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Adicionar Orçamento</Button>
            </form>
            <ul>
              {categoryBudgets.map(
                (
                  cb: CategoryBudget & {
                    category: Category;
                    envelope: BudgetEnvelope | null;
                  }
                ) => (
                  <li
                    key={cb.id}
                    className="flex justify-between items-center py-2 border-b last:border-b-0"
                  >
                    <span>
                      {cb.category.name}:{" "}
                      {cb.amount
                        ? formatCurrency(cb.amount)
                        : `${cb.percentage || "0"}% de ${cb.envelope?.name || "N/A"}`}
                    </span>
                    <form
                      action={async () => {
                        "use server";
                        await deleteCategoryBudget(cb.id);
                      }}
                    >
                      <Button type="submit" variant="destructive" size="sm">
                        Excluir
                      </Button>
                    </form>
                  </li>
                )
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export async function getCalculatedBudgets(
  userId: string,
  month: number,
  year: number
) {
  const monthlyIncome = await prisma.monthlyIncome.findUnique({
    where: { userId_month_year: { userId, month, year } },
  });

  if (!monthlyIncome) {
    return [];
  }

  const totalIncome = monthlyIncome.fixed + monthlyIncome.variable;

  const budgetEnvelopes = await prisma.budgetEnvelope.findMany({
    where: { userId },
  });

  const categoryBudgets = await prisma.categoryBudget.findMany({
    where: { userId },
    include: { category: true, envelope: true },
  });

  const calculatedBudgets = categoryBudgets.map((cb) => {
    let budgetedAmount = 0;
    if (cb.amount !== null && cb.amount !== undefined) {
      budgetedAmount = cb.amount;
    } else if (
      cb.percentage !== null &&
      cb.percentage !== undefined &&
      cb.envelope
    ) {
      const envelopeAllocation =
        budgetEnvelopes.find((e) => e.id === cb.envelopeId)?.allocation || 0;
      budgetedAmount =
        totalIncome * (envelopeAllocation / 100) * (cb.percentage / 100);
    }
    return { ...cb, budgetedAmount };
  });

  return calculatedBudgets;
}
