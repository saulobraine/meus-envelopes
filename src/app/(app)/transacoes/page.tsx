"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendDown,
  TrendUp,
  MagnifyingGlass,
  PencilSimple,
  Faders,
} from "phosphor-react";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { formatCurrency } from "@/lib/utils";
import { Suspense } from "react";
import { EditTransactionDialog } from "@/components/transactions/EditTransactionDialog";
import { Transaction } from "@/types/transaction";

export default function TransacoesPageWrapper() {
  return (
    <Suspense fallback={<div>Loading transactions...</div>}>
      <TransacoesPageContent />
    </Suspense>
  );
}

function TransacoesPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEnvelope, setSelectedEnvelope] = useState("all");
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const itemsPerPage = 5;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [envelopes, setEnvelopes] = useState<string[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const data = await getTransactions();
      setTransactions(data);
      setEnvelopes([...new Set(data.map((t) => t.envelope?.name || ""))]);
    };
    fetchTransactions();
  }, []);

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transações</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe suas movimentações financeiras
          </p>
        </div>
        <AddTransactionDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <TrendUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(
                filteredTransactions
                  .filter((t) => t.type === "INCOME")
                  .reduce((acc, t) => acc + t.amount, 0)
              )}
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
              {formatCurrency(
                filteredTransactions
                  .filter((t) => t.type === "EXPENSE")
                  .reduce((acc, t) => acc + t.amount, 0)
              )}
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
              className={`text-2xl font-bold ${filteredTransactions.reduce((acc, t) => acc + t.amount, 0) >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {formatCurrency(
                filteredTransactions.reduce(
                  (acc, t) =>
                    acc + (t.type === "INCOME" ? t.amount : -t.amount),
                  0
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Histórico de Transações</CardTitle>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 w-full md:w-auto"
                />
              </div>
              <div className="flex items-center gap-2">
                <Faders className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedEnvelope}
                  onValueChange={(value) => {
                    setSelectedEnvelope(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm || selectedEnvelope !== "all"
                    ? "Nenhuma transação encontrada com os filtros aplicados."
                    : "Nenhuma transação registrada."}
                </p>
              </div>
            ) : (
              currentTransactions.map((transaction: Transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{transaction.description}</h3>
                      <Badge
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === "INCOME"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.type === "INCOME" ? "Entrada" : "Saída"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(new Date(transaction.date))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.envelope?.name}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2 justify-end">
                      <p className="font-medium">
                        {formatCurrency(
                          transaction.type === "INCOME"
                            ? transaction.amount
                            : -transaction.amount
                        )}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (transaction) {
                            setEditingTransaction(transaction);
                          }
                        }}
                      >
                        <PencilSimple className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

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
        <EditTransactionDialog
          transaction={editingTransaction}
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
          onSave={(updatedTransaction) => {
            setTransactions((prev) =>
              prev.map((t) =>
                t.id === updatedTransaction.id ? updatedTransaction : t
              )
            );
            setEditingTransaction(null);
          }}
        />
      )}
    </div>
  );
}
