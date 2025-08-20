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
import { CurrencyInput } from "@/components/ui/currency-input";

interface AddRecurringPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (payment: {
    description: string;
    amount: number;
    frequency: "monthly" | "quarterly" | "yearly";
    nextPayment: string;
    envelope: string;
    isActive: boolean;
    envelopeType?: string;
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
    envelope: string;
    isActive: boolean;
    envelopeType: string;
  }>({
    description: "",
    amount: "",
    frequency: "monthly",
    nextPayment: "",
    envelope: "",
    isActive: true,
    envelopeType: "",
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
      formData.envelope &&
      formData.envelopeType
    ) {
      onAdd({
        description: formData.description,
        amount: parseFloat(formData.amount.replace(/\D/g, "")) / 100,
        frequency: formData.frequency,
        nextPayment: formData.nextPayment,
        envelope: formData.envelope,
        isActive: formData.isActive,
        envelopeType: formData.envelopeType,
      });
      setFormData({
        description: "",
        amount: "",
        frequency: "monthly",
        nextPayment: "",
        envelope: "",
        isActive: true,
        envelopeType: "",
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
            <Label htmlFor="envelope">Envelope</Label>
            <Input
              id="envelope"
              value={formData.envelope}
              onChange={(e) =>
                setFormData({ ...formData, envelope: e.target.value })
              }
              placeholder="Ex: Moradia, Utilities, Saúde..."
              required
            />
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
              value={formData.envelopeType}
              onValueChange={(value) =>
                setFormData({ ...formData, envelopeType: value })
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
              className="flex-1 purple-gradient"
            >
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
