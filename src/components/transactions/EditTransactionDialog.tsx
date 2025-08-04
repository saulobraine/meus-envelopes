"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: "credit" | "debit";
  envelope: string;
}

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
  onSave 
}: EditTransactionDialogProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<"credit" | "debit">("debit");
  const [envelope, setEnvelope] = useState("");

  const envelopes = [
    "Alimentação", "Receitas", "Entretenimento", "Transporte", 
    "Trabalho Extra", "Saúde", "Moradia", "Educação"
  ];

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(Math.abs(transaction.amount).toString());
      setDate(transaction.date);
      setType(transaction.type);
      setEnvelope(transaction.envelope);
    }
  }, [transaction]);

  const handleSave = () => {
    if (!transaction || !description || !amount || !date || !envelope) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const updatedTransaction = {
      ...transaction,
      description,
      amount: type === "credit" ? parseFloat(amount) : -parseFloat(amount),
      date,
      type,
      envelope
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
                variant={type === "debit" ? "default" : "outline-solid"}
                onClick={() => setType("debit")}
                className="flex-1"
              >
                Despesa
              </Button>
              <Button
                type="button"
                variant={type === "credit" ? "default" : "outline-solid"}
                onClick={() => setType("credit")}
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
                  <SelectItem key={env} value={env}>
                    {env}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
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