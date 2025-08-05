"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { addTransaction } from "@/app/_actions/transactions";
import { useRouter } from "next/navigation";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { TransactionType } from "@prisma/client";

export function AddTransactionDialog() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense"); // Padrão: Saída
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!description.trim()) newErrors.description = "Descrição é obrigatória";
    if (!amount.trim()) newErrors.amount = "Valor é obrigatório";
    if (!category) newErrors.category = "Envelope é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await addTransaction({
        description,
        amount: parseFloat(amount),
        type: type as "expense" | "income",
        category,
      });
      toast({
        title: "Transação adicionada",
        description: "A transação foi registrada com sucesso.",
      });
      setOpen(false);
      // Reset form
      setDescription("");
      setAmount("");
      setType("expense");
      setCategory("");
      setErrors({});
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao adicionar transação",
        description: "Ocorreu um erro ao registrar a transação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={loading}>
          <Plus className="mr-2" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da nova transação
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                placeholder="Ex: Supermercado, Salário..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <Label>Tipo *</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant={type === "expense" ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    type === "expense" &&
                      "bg-red-500 hover:bg-red-600 text-white"
                  )}
                  onClick={() => setType("expense")}
                >
                  <TrendingDown className="mr-2 h-4 w-4" />
                  Saída
                </Button>
                <Button
                  type="button"
                  variant={type === "income" ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    type === "income" &&
                      "bg-green-500 hover:bg-green-600 text-white"
                  )}
                  onClick={() => setType("income")}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Entrada
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="category">Envelope *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  className={errors.category ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Selecione um envelope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alimentacao">Alimentação</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                  <SelectItem value="entretenimento">Entretenimento</SelectItem>
                  <SelectItem value="saude">Saúde</SelectItem>
                  <SelectItem value="receitas">Receitas</SelectItem>
                  <SelectItem value="trabalho-extra">Trabalho Extra</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500 mt-1">{errors.category}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Transação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
