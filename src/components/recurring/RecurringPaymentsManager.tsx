"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Calendar,
  CurrencyDollar,
  Repeat,
  Clock,
  PencilSimple,
} from "phosphor-react";
import { AddRecurringPaymentDialog } from "./AddRecurringPaymentDialog";
import { EditRecurringPaymentDialog } from "./EditRecurringPaymentDialog";

interface RecurringPayment {
  id: string;
  description: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "yearly";
  nextPayment: string;
  category: string;
  isActive: boolean;
  envelope?: string;
}

export function RecurringPaymentsManager() {
  const [payments, setPayments] = useState<RecurringPayment[]>([
    {
      id: "1",
      description: "Aluguel",
      amount: 1200.0,
      frequency: "monthly",
      nextPayment: "2024-02-01",
      category: "Moradia",
      isActive: true,
    },
    {
      id: "2",
      description: "Internet",
      amount: 89.9,
      frequency: "monthly",
      nextPayment: "2024-01-20",
      category: "Utilities",
      isActive: true,
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(
    null
  );

  const addPayment = (payment: Omit<RecurringPayment, "id">) => {
    const newPayment = {
      ...payment,
      id: Date.now().toString(),
    };
    setPayments([...payments, newPayment]);
  };

  const togglePayment = (id: string) => {
    setPayments(
      payments.map((payment) =>
        payment.id === id
          ? { ...payment, isActive: !payment.isActive }
          : payment
      )
    );
  };

  const getFrequencyLabel = (frequency: RecurringPayment["frequency"]) => {
    const labels = {
      monthly: "Mensal",
      quarterly: "Trimestral",
      yearly: "Anual",
    };
    return labels[frequency];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const totalMonthly = payments
    .filter((p) => p.isActive)
    .reduce((sum, p) => {
      if (p.frequency === "monthly") return sum + p.amount;
      if (p.frequency === "quarterly") return sum + p.amount / 3;
      if (p.frequency === "yearly") return sum + p.amount / 12;
      return sum;
    }, 0);

  const activePayments = payments.filter((p) => p.isActive).length;
  const upcomingPayments = payments.filter((p) => {
    const nextDate = new Date(p.nextPayment);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextDate <= nextWeek && p.isActive;
  }).length;

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-purple">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Mensal</CardTitle>
            <CurrencyDollar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalMonthly)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-purple">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próximos 7 dias
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {upcomingPayments}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-purple">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pagamentos Ativos
            </CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePayments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pagamentos Recorrentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pagamentos Recorrentes</CardTitle>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="purple-gradient shadow-purple-glow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Pagamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                  payment.isActive
                    ? "hover:bg-muted/50 border-border"
                    : "opacity-60 border-dashed"
                }`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{payment.description}</h3>
                    <Badge variant={payment.isActive ? "default" : "secondary"}>
                      {payment.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline">
                      {getFrequencyLabel(payment.frequency)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>{payment.category}</span>
                    {payment.envelope && (
                      <Badge variant="outline" className="text-xs">
                        {payment.envelope}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-lg font-semibold text-primary">
                    {formatCurrency(payment.amount)}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(payment.nextPayment)}
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingPayment(payment)}
                  >
                    <PencilSimple className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePayment(payment.id)}
                  >
                    {payment.isActive ? "Pausar" : "Ativar"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AddRecurringPaymentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAdd={addPayment}
      />

      <EditRecurringPaymentDialog
        payment={editingPayment}
        open={!!editingPayment}
        onOpenChange={(open) => !open && setEditingPayment(null)}
        onSave={(updatedPayment) => {
          setPayments(
            payments.map((p) =>
              p.id === updatedPayment.id ? updatedPayment : p
            )
          );
          setEditingPayment(null);
        }}
      />
    </div>
  );
}
