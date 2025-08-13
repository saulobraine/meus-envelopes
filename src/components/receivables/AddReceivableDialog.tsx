"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CurrencyInput } from "@/components/ui/currency-input";

interface AddReceivableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (receivable: {
    description: string;
    amount: number;
    dueDate: string;
    client: string;
    status: "pending" | "received" | "overdue";
    isRecurring?: boolean;
    frequency?: "weekly" | "monthly" | "yearly";
    envelope?: string;
  }) => void;
}

export function AddReceivableDialog({
  open,
  onOpenChange,
  onAdd,
}: AddReceivableDialogProps) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    dueDate: "",
    client: "",
    status: "pending" as "pending" | "received" | "overdue",
    isRecurring: false,
    frequency: "monthly" as "weekly" | "monthly" | "yearly",
    envelope: "",
  });

  const envelopes = [
    "Vendas",
    "Serviços",
    "Consultoria",
    "Licenciamento",
    "Outros",
  ];

  const clients = [
    "Cliente A",
    "Cliente B",
    "Cliente C",
    "Cliente D",
    "Cliente E",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.description ||
      !formData.amount ||
      !formData.dueDate ||
      !formData.client
    ) {
      return;
    }

    onAdd({
      description: formData.description,
      amount: parseFloat(formData.amount.replace(/\D/g, "")) / 100,
      dueDate: formData.dueDate,
      client: formData.client,
      status: formData.status,
      isRecurring: formData.isRecurring,
      frequency: formData.isRecurring ? formData.frequency : undefined,
      envelope: formData.envelope || undefined,
    });

    setFormData({
      description: "",
      amount: "",
      dueDate: "",
      client: "",
      status: "pending",
      isRecurring: false,
      frequency: "monthly",
      envelope: "",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Recebível</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Ex: Venda de produto, Serviço de consultoria..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Cliente</Label>
            <Select
              value={formData.client}
              onValueChange={(value) =>
                setFormData({ ...formData, client: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client} value={client}>
                    {client}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <CurrencyInput
              id="amount"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="envelope">Envelope</Label>
            <Select
              value={formData.envelope}
              onValueChange={(value) =>
                setFormData({ ...formData, envelope: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o envelope" />
              </SelectTrigger>
              <SelectContent>
                {envelopes.map((envelope) => (
                  <SelectItem key={envelope} value={envelope}>
                    {envelope}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as "pending" | "received" | "overdue",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="received">Recebido</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked: boolean) =>
                setFormData({ ...formData, isRecurring: checked as boolean })
              }
            />
            <Label htmlFor="isRecurring">Conta recorrente</Label>
          </div>

          {formData.isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    frequency: value as "weekly" | "monthly" | "yearly",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
