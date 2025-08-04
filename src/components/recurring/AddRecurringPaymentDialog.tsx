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

interface AddRecurringPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (payment: {
    description: string;
    amount: number;
    frequency: "monthly" | "quarterly" | "yearly";
    nextPayment: string;
    category: string;
    isActive: boolean;
    envelope?: string;
  }) => void;
}

export function AddRecurringPaymentDialog({
  open,
  onOpenChange,
  onAdd,
}: AddRecurringPaymentDialogProps) {
  const [formData, setFormData] = useState<{
    description: string;
    amount: string;
    frequency: "monthly" | "quarterly" | "yearly";
    nextPayment: string;
    category: string;
    isActive: boolean;
    envelope: string;
  }>({
    description: "",
    amount: "",
    frequency: "monthly",
    nextPayment: "",
    category: "",
    isActive: true,
    envelope: "",
  });

  const envelopes = [
    "Moradia",
    "Utilities",
    "Saúde",
    "Educação",
    "Transporte",
    "Entretenimento",
    "Alimentação",
    "Seguros",
    "Outros",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.description &&
      formData.amount &&
      formData.nextPayment &&
      formData.category &&
      formData.envelope
    ) {
      onAdd({
        description: formData.description,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        nextPayment: formData.nextPayment,
        category: formData.category,
        isActive: formData.isActive,
        envelope: formData.envelope,
      });
      setFormData({
        description: "",
        amount: "",
        frequency: "monthly",
        nextPayment: "",
        category: "",
        isActive: true,
        envelope: "",
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Pagamento Recorrente</DialogTitle>
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
              placeholder="Ex: Aluguel, Internet, Academia..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="Ex: Moradia, Utilities, Saúde..."
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
            <Label htmlFor="frequency">Frequência</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  frequency: value as "monthly" | "quarterly" | "yearly",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
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
            <Label htmlFor="nextPayment">Próximo Pagamento</Label>
            <Input
              id="nextPayment"
              type="date"
              value={formData.nextPayment}
              onChange={(e) =>
                setFormData({ ...formData, nextPayment: e.target.value })
              }
              required
            />
          </div>

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
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
