"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendDown,
  TrendUp,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  Faders,
  Warning,
  ArrowClockwise,
  Upload,
} from "phosphor-react";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import { get as getTransactions } from "@/app/_actions/transactions/get";
import { remove as removeTransaction } from "@/app/_actions/transactions/remove";
import { removeAllTransactions } from "@/app/_actions/transactions/removeAll";
import { formatCurrency } from "@/lib/currency";
import { APP_CONFIG } from "@/lib/config";
import { Suspense } from "react";
import { Transaction } from "@/types/transaction";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// Hook para contador animado
function useAnimatedCounter(targetValue: number, duration: number = 1000) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = targetValue;
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Função de easing (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;

      setDisplayValue(Math.round(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    if (targetValue !== displayValue) {
      requestAnimationFrame(animate);
    }
  }, [targetValue, duration]);

  return displayValue;
}

// Componente skeleton específico para as transações
function TransactionsListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-20 ml-auto" />
            <div className="flex gap-2 justify-end">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEnvelope, setSelectedEnvelope] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [availableMonths, setAvailableMonths] = useState<
    { date: Date; label: string }[]
  >([]);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<
    string | null
  >(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const itemsPerPage = APP_CONFIG.PAGINATION.ITEMS_PER_PAGE;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [envelopes, setEnvelopes] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTransactions();
      setTransactions(data);
      setEnvelopes([...new Set(data.map((t) => t.envelope?.name || ""))]);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      // Check if it's a database connection error
      if (
        errorMessage.includes("Can't reach database server") ||
        errorMessage.includes("PrismaClientInitializationError") ||
        errorMessage.includes("connection")
      ) {
        setError(
          "Não foi possível conectar ao banco de dados. Tente novamente mais tarde."
        );
        toast({
          title: "Erro de conexão",
          description:
            "Não foi possível conectar ao banco de dados. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } else {
        setError("Erro ao carregar transações. Tente novamente.");
        toast({
          title: "Erro",
          description: "Erro ao carregar transações. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    fetchTransactions();
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleTransactionAdded = () => {
    // Recarrega os dados do servidor para garantir consistência
    fetchTransactions();

    // Reseta para a primeira página se necessário
    if (currentPage !== 1) {
      setCurrentPage(1);
    }

    // Fecha o diálogo
    setIsAddDialogOpen(false);
  };

  // Resetar filtros quando necessário
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedEnvelope("all");
    setCurrentPage(1);
  };

  // Atualizar mês selecionado quando transações são carregadas
  useEffect(() => {
    if (availableMonths.length > 0) {
      // Selecionar o último mês com transações disponíveis
      setSelectedMonth(availableMonths[0].date);
    }
  }, [availableMonths]);

  // Gerar meses disponíveis baseado nas transações
  const generateAvailableMonths = useMemo(() => {
    // Obter meses únicos das transações
    const uniqueMonths = new Set<string>();

    // Adicionar meses das transações existentes
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const monthKey = `${transactionDate.getFullYear()}-${transactionDate.getMonth()}`;
      uniqueMonths.add(monthKey);
    });

    // Se não há transações, retornar array vazio
    if (uniqueMonths.size === 0) return [];

    // Converter para array de objetos com labels
    const monthsArray = Array.from(uniqueMonths).map((monthKey) => {
      const [year, month] = monthKey.split("-").map(Number);
      const date = new Date(year, month, 1);

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      let label: string;
      if (year === currentYear && month === currentMonth) {
        label = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(
          date
        );
      } else if (year === currentYear) {
        label = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(
          date
        );
      } else {
        label = `${new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date)} de ${year}`;
      }

      // Capitalizar o label
      label = label.charAt(0).toUpperCase() + label.slice(1);

      return { date, label };
    });

    // Ordenar por data (mais recente primeiro)
    return monthsArray.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions]);

  // Atualizar meses disponíveis quando as transações mudarem
  useEffect(() => {
    setAvailableMonths(generateAvailableMonths);
  }, [generateAvailableMonths]);

  // Filtrar transações por mês, envelope e busca
  const filteredTransactions = useMemo<Transaction[]>(() => {
    // Se não há mês selecionado ou não há transações, retornar array vazio
    if (!selectedMonth || transactions.length === 0) return [];

    return transactions.filter((transaction) => {
      // Filtro por mês
      const transactionDate = new Date(transaction.date);
      const selectedMonthDate = new Date(selectedMonth);
      const matchesMonth =
        transactionDate.getMonth() === selectedMonthDate.getMonth() &&
        transactionDate.getFullYear() === selectedMonthDate.getFullYear();

      // Filtro por busca
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.envelope?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Filtro por envelope
      const matchesEnvelope =
        selectedEnvelope === "all" ||
        transaction.envelope?.name === selectedEnvelope;

      return matchesMonth && matchesSearch && matchesEnvelope;
    });
  }, [transactions, searchTerm, selectedEnvelope, selectedMonth]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Cálculos para os cards
  // Remuneração total (envelope global "Remuneração")
  const totalRemuneration = filteredTransactions
    .filter(
      (t) =>
        t.type === "INCOME" &&
        (t.envelope?.isGlobal === true || t.envelope?.name === "Remuneração")
    )
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  // Outras entradas (entradas que não são remuneração)
  const otherIncome = filteredTransactions
    .filter(
      (t) =>
        t.type === "INCOME" &&
        t.envelope?.isGlobal !== true &&
        t.envelope?.name !== "Remuneração"
    )
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  // Total de entradas (remuneração + outras entradas)
  const totalIncome = totalRemuneration + otherIncome;

  // Saídas (despesas)
  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  // Saldo total = Entradas - Saídas
  const totalBalance = totalIncome - totalExpenses;

  // Contadores animados
  const animatedRemuneration = useAnimatedCounter(totalRemuneration);
  const animatedOtherIncome = useAnimatedCounter(otherIncome);
  const animatedExpenses = useAnimatedCounter(totalExpenses);
  const animatedBalance = useAnimatedCounter(totalBalance);

  // Função para excluir transação
  const handleDeleteTransaction = async (transactionId: string) => {
    setDeletingTransactionId(transactionId);
    try {
      await removeTransaction(transactionId);
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso.",
      });
      // Recarrega os dados
      fetchTransactions();
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a transação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingTransactionId(null);
    }
  };

  // Função para abrir o diálogo de confirmação
  const openDeleteConfirm = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteConfirmOpen(true);
  };

  // Função para deletar todas as transações
  const handleDeleteAllTransactions = async () => {
    setIsDeletingAll(true);
    try {
      const result = await removeAllTransactions();
      toast({
        title: "Transações excluídas",
        description: result.message,
      });
      // Recarrega os dados
      fetchTransactions();
      setDeleteAllConfirmOpen(false);
    } catch (error) {
      console.error("Erro ao deletar todas as transações:", error);
      toast({
        title: "Erro ao excluir",
        description:
          "Não foi possível excluir todas as transações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Se há erro, mostrar mensagem de erro com opção de tentar novamente
  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Transações</h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe suas movimentações financeiras
            </p>
          </div>
        </div>

        <Alert variant="destructive">
          <Warning className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isLoading}
              className="ml-4"
            >
              <ArrowClockwise
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Warning className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Não foi possível carregar as transações no momento.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Verifique sua conexão com a internet e tente novamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transações</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe suas movimentações financeiras
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/transacoes/importacoes")}
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <TrendUp className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
          <TransactionDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onTransactionAdded={handleTransactionAdded}
          />
          {transactions.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setDeleteAllConfirmOpen(true)}
              title={`Deletar ${transactions.length} transações`}
            >
              <Trash className="w-4 h-4 mr-2" />
              Deletar Todas ({transactions.length})
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remuneração</CardTitle>
            <TrendUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(animatedRemuneration || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outras Entradas
            </CardTitle>
            <TrendUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {formatCurrency(animatedOtherIncome || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <TrendDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(animatedExpenses || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <div className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${(animatedBalance || 0) >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {formatCurrency(animatedBalance || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Transações</CardTitle>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Select de Meses */}
              <Select
                value={selectedMonth.toISOString()}
                onValueChange={(value) => {
                  const date = new Date(value);
                  setSelectedMonth(date);
                  setCurrentPage(1); // Voltar para primeira página ao mudar mês
                }}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Selecionar mês" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem
                      key={month.date.toISOString()}
                      value={month.date.toISOString()}
                    >
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedEnvelope}
                onValueChange={setSelectedEnvelope}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por envelope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os envelopes</SelectItem>
                  {envelopes.map((envelope) => (
                    <SelectItem key={envelope} value={envelope}>
                      {envelope}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Botão para resetar filtros */}
              <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full md:w-auto"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TransactionsListSkeleton />}>
            {isLoading ? (
              <TransactionsListSkeleton />
            ) : currentTransactions.length === 0 ? (
              <div className="text-center py-12">
                {searchTerm || selectedEnvelope !== "all" ? (
                  <p className="text-muted-foreground">
                    Nenhuma transação encontrada com os filtros aplicados.
                  </p>
                ) : filteredTransactions.length === 0 ? (
                  <p className="text-muted-foreground">
                    Nenhuma transação encontrada para o mês selecionado.
                  </p>
                ) : (
                  <div className="space-y-6">
                    <div className="mx-auto w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-800/40 dark:to-blue-800/40 rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <TrendUp className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-2" />
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                          💰
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 text-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        🎯 Seus envelopes estão esperando por você!
                      </h3>

                      <div className="max-w-lg mx-auto space-y-3">
                        <p className="text-gray-600 dark:text-gray-300 text-lg">
                          Parece que você ainda não registrou nenhuma transação.
                          Que tal começar organizando suas finanças?
                        </p>

                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                          <p className="text-blue-800 dark:text-blue-100 text-sm font-medium">
                            💡 <strong>Dica:</strong> Comece adicionando sua
                            primeira entrada ou saída!
                          </p>
                        </div>
                      </div>

                      <div className="pt-6 space-y-4">
                        <Button
                          onClick={() => setIsAddDialogOpen(true)}
                          size="lg"
                          className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white dark:text-gray-900 px-8 py-3 text-lg font-semibold transition-all duration-200"
                        >
                          <TrendUp className="w-5 h-5 mr-3" />
                          Adicionar Primeira Transação
                        </Button>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-500 dark:text-gray-300">
                            🚀 <strong>Primeiro passo:</strong> Clique no botão
                            acima e comece sua jornada financeira!
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-400 italic">
                            🏦 "Meus Envelopes" - Porque dinheiro não cresce em
                            árvore, mas pode ser organizado em envelopes! 🌳
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {currentTransactions.map((transaction: Transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {transaction.type === "INCOME" ? (
                        <div className="p-2 bg-green-100 rounded-full">
                          <TrendUp className="h-4 w-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="p-2 bg-red-100 rounded-full">
                          <TrendDown className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {transaction.date.toLocaleDateString("pt-BR")}
                          </p>
                          <Badge variant="default" className="text-xs">
                            {transaction.envelope?.name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p
                        className={`font-bold ${
                          transaction.type === "INCOME"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTransaction(transaction)}
                        >
                          <PencilSimple className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteConfirm(transaction)}
                          disabled={deletingTransactionId === transaction.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Suspense>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {editingTransaction && (
        <TransactionDialog
          transaction={editingTransaction}
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
          onTransactionUpdated={() => {
            // Recarrega os dados do servidor para garantir consistência
            fetchTransactions();
            setEditingTransaction(null);
          }}
          mode="edit"
        />
      )}

      {deleteConfirmOpen && transactionToDelete && (
        <AlertDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Tem certeza que deseja excluir esta transação?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Esta transação será removida
                permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleDeleteTransaction(transactionToDelete.id);
                  setDeleteConfirmOpen(false);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Diálogo de confirmação para deletar todas as transações */}
      <AlertDialog
        open={deleteAllConfirmOpen}
        onOpenChange={setDeleteAllConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja excluir TODAS as transações?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as {transactions.length}{" "}
              transações serão removidas permanentemente.
              <br />
              <br />
              <strong className="text-red-600">
                ⚠️ ATENÇÃO: Esta é uma ação irreversível!
              </strong>
              <br />
              <br />
              <span className="text-sm text-gray-600">
                • Todas as transações serão perdidas permanentemente • Os
                envelopes não serão afetados • Esta ação não pode ser desfeita
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAllConfirmOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllTransactions}
              disabled={isDeletingAll}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingAll ? (
                <>
                  <ArrowClockwise className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  Excluir Todas ({transactions.length})
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
