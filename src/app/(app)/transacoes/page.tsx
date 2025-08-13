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
import { formatCurrency } from "@/lib/currency";
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
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<
    string | null
  >(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const itemsPerPage = 5;

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
  };

  const filteredTransactions = useMemo<Transaction[]>(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.envelope?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesEnvelope =
        selectedEnvelope === "all" ||
        transaction.envelope?.name === selectedEnvelope;
      return matchesSearch && matchesEnvelope;
    });
  }, [transactions, searchTerm, selectedEnvelope]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Cálculos para os cards
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalBalance = totalIncome - totalExpenses;

  // Contadores animados
  const animatedIncome = useAnimatedCounter(totalIncome);
  const animatedExpenses = useAnimatedCounter(totalExpenses);
  const animatedBalance = useAnimatedCounter(totalBalance);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

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
        <TransactionDialog onTransactionAdded={handleTransactionAdded} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <TrendUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(animatedIncome)}
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
              {formatCurrency(animatedExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <div className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${animatedBalance >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {formatCurrency(animatedBalance)}
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TransactionsListSkeleton />}>
            {isLoading ? (
              <TransactionsListSkeleton />
            ) : currentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm || selectedEnvelope !== "all"
                    ? "Nenhuma transação encontrada com os filtros aplicados."
                    : "Nenhuma transação registrada."}
                </p>
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
                            {formatDate(new Date(transaction.date))}
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
    </div>
  );
}
