import { getAuthenticatedUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { createOperation, deleteOperation } from "@/app/_actions/operation/operation";
import { createEnvelope, deleteEnvelope, getEnvelopes } from "@/app/_actions/envelope";
import { revalidatePath } from "next/cache";
import { formatCurrency } from "@/lib/currency";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { H1, P } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";

export default async function DashboardPage() {
  const { user } = await getAuthenticatedUser();

  const operations = await prisma.operation.findMany({
    where: { userId: user.id },
    include: { envelope: true },
    orderBy: { date: "desc" },
  });

  const envelopes = await getEnvelopes();

  const income = operations
    .filter((op) => op.type === "INCOME")
    .reduce((sum, op) => sum + op.amount, 0);

  const expense = operations
    .filter((op) => op.type === "EXPENSE")
    .reduce((sum, op) => sum + op.amount, 0);

  return (
    <div className="container mx-auto p-4">
      <H1 className="mb-4 font-normal text-xl">Painel</H1>

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
                <CurrencyInput name="amount" id="amount" required />
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
                <Label htmlFor="envelopeId">Envelope</Label>
                <Select name="envelopeId">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar Envelope (Opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {envelopes.map((envelope) => (
                      <SelectItem key={envelope.id} value={envelope.id}>
                        {envelope.name}
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
            <CardTitle>Envelopes</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData) => {
                "use server";
                await createEnvelope(formData);
                revalidatePath("/painel");
              }}
              className="flex space-x-2 mb-4"
            >
              <Input
                type="text"
                name="name"
                placeholder="Nome do Envelope"
                required
              />
              <Button type="submit">Adicionar Envelope</Button>
            </form>
            <ul>
              {envelopes.map((envelope) => (
                <li
                  key={envelope.id}
                  className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <span>{envelope.name}</span>
                  <form
                    action={async () => {
                      "use server";
                      await deleteEnvelope(envelope.id);
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
                    {formatCurrency(operation.amount)}
                  </P>
                  {operation.envelope && (
                    <P className="text-xs text-gray-500 dark:text-gray-400">
                      Envelope: {operation.envelope.name}
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
