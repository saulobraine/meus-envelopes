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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Transaction } from "@/types/transaction";
import { get as getEnvelopes } from "@/app/_actions/envelope/get";
import { Envelope } from "@prisma/client";
import { update as updateTransaction } from "@/app/_actions/transactions/update";

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (transaction: Transaction) => void;
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onSave,
}: EditTransactionDialogProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [envelope, setEnvelope] = useState("");
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);

  useEffect(() => {
    const fetchEnvelopes = async () => {
      const data = await getEnvelopes();
      setEnvelopes(data);
    };
    fetchEnvelopes();
  }, []);

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(Math.abs(transaction.amount / 100).toString()); // Convert from cents
      setDate(new Date(transaction.date).toISOString().split("T")[0]);
      setType(transaction.type);
      setEnvelope(transaction.envelope?.name || "");
    }
  }, [transaction]);

  const handleSave = () => {
    if (!transaction || !description || !amount || !date || !envelope) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const selectedEnvelope = envelopes.find((e) => e.name === envelope);

    if (!selectedEnvelope) {
      toast.error("Envelope inválido");
      return;
    }

    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("type", type);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("envelopeId", selectedEnvelope.id);

    updateTransaction(transaction.id, formData);

    const updatedTransaction: Transaction = {
      ...transaction,
      description,
      amount: Math.round(parseFloat(amount) * 100), // Convert to cents
      date: new Date(date),
      type,
      envelopeId: selectedEnvelope.id,
      envelope: selectedEnvelope,
    };

    onSave(updatedTransaction);
    toast.success("Transação atualizada com sucesso!");
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da transação"
            />
          </div>

          <div>
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
            />
          </div>

          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <Label>Tipo</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant={type === "EXPENSE" ? "default" : "outline"}
                onClick={() => setType("EXPENSE")}
                className="flex-1"
              >
                Despesa
              </Button>
              <Button
                type="button"
                variant={type === "INCOME" ? "default" : "outline"}
                onClick={() => setType("INCOME")}
                className="flex-1"
              >
                Receita
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="envelope">Envelope</Label>
            <Select value={envelope} onValueChange={setEnvelope}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o envelope" />
              </SelectTrigger>
              <SelectContent>
                {envelopes.map((env) => (
                  <SelectItem key={env.id} value={env.name}>
                    {env.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
