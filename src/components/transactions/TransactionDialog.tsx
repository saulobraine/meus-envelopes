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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { create as addTransaction } from "@/app/_actions/transactions/create";
import { update as updateTransaction } from "@/app/_actions/transactions/update";
import { get as getEnvelopes } from "@/app/_actions/envelope/get";
import { useRouter } from "next/navigation";
import { Plus, TrendUp, TrendDown, Calendar as CalendarIcon } from "phosphor-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Envelope, Transaction } from "@prisma/client";

interface TransactionDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTransactionAdded?: () => void;
  onTransactionUpdated?: () => void;
  defaultType?: "income" | "expense";
  transaction?: Transaction | null; // Para edição
  mode?: "add" | "edit"; // Modo do diálogo
}

export function TransactionDialog({
  open: controlledOpen,
  onOpenChange,
  onTransactionAdded,
  onTransactionUpdated,
  defaultType = "expense",
  transaction = null,
  mode = "add",
}: TransactionDialogProps) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState(defaultType);
  const [envelope, setEnvelope] = useState<string>("");
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const { toast } = useToast();

  // Use controlled open state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Update type when defaultType changes
  useEffect(() => {
    setType(defaultType);
  }, [defaultType]);

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (transaction && mode === "edit") {
      setDescription(transaction.description);
      setAmount((transaction.amount / 100).toFixed(2)); // Converter de centavos para reais
      setType(transaction.type === "INCOME" ? "income" : "expense");
      setEnvelope(transaction.envelopeId || "");
      setDate(new Date(transaction.date));
    }
  }, [transaction, mode]);

  useEffect(() => {
    const fetchEnvelopes = async () => {
      try {
        const fetchedEnvelopes = await getEnvelopes();
        setEnvelopes(fetchedEnvelopes);
      } catch (error) {
        console.error("Failed to fetch envelopes:", error);
        toast({
          title: "Erro ao buscar envelopes",
          description: "Não foi possível carregar os envelopes do servidor.",
          variant: "destructive",
        });
      }
    };

    if (isOpen) {
      fetchEnvelopes();
    }
  }, [isOpen]); // Removido toast das dependências para evitar loops infinitos

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!description.trim()) newErrors.description = "Descrição é obrigatória";
    if (!amount.trim()) newErrors.amount = "Valor é obrigatório";
    if (!date) newErrors.date = "Data é obrigatória";
    if (
      !envelope ||
      envelope.trim() === "" ||
      envelope === "null" ||
      envelope === "undefined" ||
      envelope === "0"
    ) {
      newErrors.envelope = "Envelope é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("description", description);
      formData.append("amount", amount.replace(/\D/g, ""));
      formData.append("type", type === "expense" ? "EXPENSE" : "INCOME");

      // Garantir que o envelopeId seja válido
      if (
        envelope &&
        envelope.trim() !== "" &&
        envelope !== "null" &&
        envelope !== "undefined" &&
        envelope !== "0"
      ) {
        formData.append("envelopeId", envelope);
      } else {
        formData.append("envelopeId", "");
      }

      formData.append("date", date.toISOString());

      if (mode === "edit" && transaction) {
        await updateTransaction(transaction.id, formData);
        toast({
          title: "Transação atualizada",
          description: "A transação foi atualizada com sucesso.",
        });
      } else {
        await addTransaction(formData);
        toast({
          title: "Transação adicionada",
          description: "A transação foi registrada com sucesso.",
        });
      }

      setIsOpen(false);
      // Reset form apenas se for modo de adição
      if (mode === "add") {
        setDescription("");
        setAmount("");
        setType(defaultType);
        setEnvelope("");
        setErrors({});
        setDate(new Date()); // Reset date
      }

      // Chama o callback apropriado
      if (mode === "edit" && onTransactionUpdated) {
        onTransactionUpdated();
      } else if (mode === "add" && onTransactionAdded) {
        onTransactionAdded();
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      // Check if it's a database connection error
      if (
        errorMessage.includes("Can't reach database server") ||
        errorMessage.includes("PrismaClientInitializationError") ||
        errorMessage.includes("connection")
      ) {
        toast({
          title: "Erro de conexão",
          description:
            "Não foi possível conectar ao banco de dados. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao adicionar transação",
          description:
            "Ocorreu um erro ao registrar a transação. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!onOpenChange && (
        <DialogTrigger asChild>
          <Button disabled={loading}>
            <Plus className="mr-2" />
            Nova Transação
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Transação" : "Adicionar Transação"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit" 
              ? "Edite os detalhes da transação" 
              : "Preencha os detalhes da nova transação"
            }
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
              <CurrencyInput
                id="amount"
                placeholder="R$ 0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <Label htmlFor="date">Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? date.toLocaleDateString("pt-BR") : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-sm text-red-500 mt-1">{errors.date}</p>
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
                  <TrendDown className="mr-2 h-4 w-4" />
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
                  <TrendUp className="mr-2 h-4 w-4" />
                  Entrada
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="envelope">Envelope *</Label>
              <Select value={envelope} onValueChange={setEnvelope}>
                <SelectTrigger
                  className={errors.envelope ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Selecione um envelope" />
                </SelectTrigger>
                <SelectContent>
                  {envelopes.map((envelope) => (
                    <SelectItem key={envelope.id} value={envelope.id}>
                      {envelope.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.envelope && (
                <p className="text-sm text-red-500 mt-1">{errors.envelope}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? (mode === "edit" ? "Salvando..." : "Salvando...") 
                : (mode === "edit" ? "Atualizar Transação" : "Salvar Transação")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
