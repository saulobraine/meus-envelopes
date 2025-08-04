"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Search, Edit, Filter } from "lucide-react";
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
import { useState, useMemo } from "react";
import { EditTransactionDialog } from "@/components/transactions/EditTransactionDialog";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: "credit" | "debit";
  envelope: string;
}

export default function OperacoesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEnvelope, setSelectedEnvelope] = useState("all");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const itemsPerPage = 5;

  const transactions: Transaction[] = [
    {
      id: 1,
      description: "Supermercado Extra",
      amount: -450.32,
      date: "2024-03-20",
      type: "debit",
      envelope: "Alimentação",
    },
    {
      id: 2,
      description: "Salário",
      amount: 5000.0,
      date: "2024-03-15",
      type: "credit",
      envelope: "Receitas",
    },
    {
      id: 3,
      description: "Netflix",
      amount: -39.9,
      date: "2024-03-10",
      type: "debit",
      envelope: "Entretenimento",
    },
    {
      id: 4,
      description: "Uber",
      amount: -25.5,
      date: "2024-03-08",
      type: "debit",
      envelope: "Transporte",
    },
    {
      id: 5,
      description: "Freelance",
      amount: 800.0,
      date: "2024-03-05",
      type: "credit",
      envelope: "Trabalho Extra",
    },
    {
      id: 6,
      description: "Farmácia",
      amount: -45.8,
      date: "2024-03-03",
      type: "debit",
      envelope: "Saúde",
    },
  ];

  const envelopes = [...new Set(transactions.map((t) => t.envelope))];

  const filteredTransactions = useMemo<Transaction[]>(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.envelope.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEnvelope =
        selectedEnvelope === "all" || transaction.envelope === selectedEnvelope;
      return matchesSearch && matchesEnvelope;
    });
  }, [transactions, searchTerm, selectedEnvelope]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Math.abs(value));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(
                  filteredTransactions
                    .filter((t) => t.amount > 0)
                    .reduce((acc, t) => acc + t.amount, 0)
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saídas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {formatCurrency(
                  filteredTransactions
                    .filter((t) => t.amount < 0)
                    .reduce((acc, t) => acc + Math.abs(t.amount), 0)
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
                  filteredTransactions.reduce((acc, t) => acc + t.amount, 0)
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
                  <Filter className="h-4 w-4 text-muted-foreground" />
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
                        <h3 className="font-medium">
                          {transaction.description}
                        </h3>
                        <Badge
                          variant={
                            transaction.type === "credit"
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {transaction.type === "credit" ? "Entrada" : "Saída"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(transaction.date)}
                      </div>
                      {transaction.envelope && (
                        <div className="text-xs">
                          <Badge variant="outline" className="text-xs">
                            {transaction.envelope}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2 justify-end">
                        <div
                          className={`text-lg font-semibold ${transaction.amount >= 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {transaction.amount >= 0 ? "+" : "-"}{" "}
                          {formatCurrency(transaction.amount)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (transaction) {
                              setEditingTransaction(transaction);
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
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
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
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
              // In a real app, you would update the transaction in your data source
              setEditingTransaction(null);
            }}
          />
        )}
      </div>
  );
}
