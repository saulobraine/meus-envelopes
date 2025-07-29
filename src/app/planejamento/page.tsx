import { getAuthenticatedUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { createEnvelope, deleteEnvelope, getEnvelopes } from "@/app/_actions/envelope";

const monthlyIncomeSchema = z.object({
  fixed: z.number().int().nonnegative(),
  variable: z.number().int().nonnegative().optional().default(0),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
});

import { parseCurrency } from "@/lib/currency";

export async function createMonthlyIncome(formData: FormData) {
  "use server";
  const { user } = await getAuthenticatedUser();

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

  revalidatePath("/planejamento");
}

export default async function PlanningPage() {
  const { user } = await getAuthenticatedUser();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [monthlyIncome, envelopes] = await Promise.all([
    prisma.monthlyIncome.findUnique({
      where: {
        userId_month_year: {
          userId: user.id,
          month: currentMonth,
          year: currentYear,
        },
      },
    }),
    getEnvelopes(),
  ]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Planejamento</h1>

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
                  defaultValue={monthlyIncome?.fixed || 0}
                  required
                />
              </div>
              <div>
                <Label htmlFor="variable">Renda Variável</Label>
                <CurrencyInput
                  name="variable"
                  id="variable"
                  defaultValue={monthlyIncome?.variable || 0}
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
            <CardTitle>Envelopes</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createEnvelope} className="space-y-4 mb-4">
              <div>
                <Label htmlFor="name">Nome do Envelope</Label>
                <Input type="text" name="name" id="name" required />
              </div>
              <div>
                <Label htmlFor="value">Valor</Label>
                <CurrencyInput name="value" id="value" required />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONETARY">Monetário</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Adicionar Envelope</Button>
            </form>
            <ul>
              {envelopes.map((envelope) => (
                <li
                  key={envelope.id}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <span>
                    {envelope.name} (
                    {envelope.type === "MONETARY"
                      ? formatCurrency(envelope.value)
                      : `${envelope.value}%`}
                    )
                  </span>
                  <form
                    action={async () => {
                      "use server";
                      await deleteEnvelope(envelope.id);
                    }}
                  >
                    <Button
                      type="submit"
                      variant="destructive"
                      size="sm"
                      disabled={!envelope.isDeletable}
                    >
                      Excluir
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

