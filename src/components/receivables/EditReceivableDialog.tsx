"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Receivable {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  client: string;
  status: "pending" | "received" | "overdue";
  isRecurring?: boolean;
  frequency?: "weekly" | "monthly" | "yearly";
  envelope?: string;
}

interface EditReceivableDialogProps {
  receivable: Receivable | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (receivable: Receivable) => void;
}

export function EditReceivableDialog({
  receivable,
  open,
  onOpenChange,
  onSave,
}: EditReceivableDialogProps) {
  const [formData, setFormData] = useState<{
    description: string;
    amount: string;
    dueDate: string;
    client: string;
    status: "pending" | "received" | "overdue";
    isRecurring: boolean;
    frequency: "weekly" | "monthly" | "yearly";
    envelope: string;
  }>({
    description: "",
    amount: "",
    dueDate: "",
    client: "",
    status: "pending",
    isRecurring: false,
    frequency: "monthly",
    envelope: "",
  });

  const envelopes = [
    "Receitas",
    "Trabalho Extra",
    "Prestação de Serviços",
    "Vendas",
    "Consultoria",
    "Freelance",
    "Investimentos",
    "Outros",
  ];

  useEffect(() => {
    if (receivable) {
      setFormData({
        description: receivable.description,
        amount: receivable.amount.toString(),
        dueDate: receivable.dueDate,
        client: receivable.client,
        status: receivable.status,
        isRecurring: receivable.isRecurring || false,
        frequency: receivable.frequency || "monthly",
        envelope: receivable.envelope || "",
      });
    }
  }, [receivable]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivable) return;

    if (
      formData.description &&
      formData.amount &&
      formData.dueDate &&
      formData.client &&
      formData.envelope
    ) {
      const updatedReceivable = {
        ...receivable,
        description: formData.description,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        client: formData.client,
        status: formData.status,
        isRecurring: formData.isRecurring,
        frequency: formData.isRecurring ? formData.frequency : undefined,
        envelope: formData.envelope,
      };

      onSave(updatedReceivable);
      toast.success("Conta a receber atualizada com sucesso!");
    }
  };

  if (!receivable) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Conta a Receber</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Descrição do serviço/produto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Cliente</Label>
            <Input
              id="client"
              value={formData.client}
              onChange={(e) =>
                setFormData({ ...formData, client: e.target.value })
              }
              placeholder="Nome do cliente"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
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
            <Button
              type="submit"
              className="flex-1 purple-gradient shadow-purple-glow"
            >
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
