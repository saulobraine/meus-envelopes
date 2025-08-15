"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ArrowLeft,
  Download,
  MagnifyingGlass,
  Check,
  X,
  Warning,
  Calendar,
  CurrencyDollar,
  Clock,
  ArrowClockwise,
  Question,
} from "phosphor-react";
import { formatCurrency } from "@/lib/currency";
import { APP_CONFIG } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";

interface ImportedTransaction {
  id: string;
  status: "imported" | "skipped" | "error" | "pending" | "processing";
  date: string;
  description: string;
  amount: number;
  envelope?: string;
  errorMessage?: string;
  rawData: any;
  rowNumber?: number;
  processedAt?: string;
}

export default function ImportDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const jobId = params.id as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const itemsPerPage = APP_CONFIG.PAGINATION.ITEMS_PER_PAGE;

  // Remover dados mock e usar dados reais
  const [transactions, setTransactions] = useState<ImportedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    imported: 0,
    errors: 0,
    skipped: 0,
  });

  // Buscar estatísticas da importação
  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/imports/${jobId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    }
  };

  // Buscar transações
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const url = `/api/imports/${jobId}/transactions?page=${currentPage}&limit=${itemsPerPage}&status=${statusFilter}&search=${searchTerm}`;
      console.log("Buscando transações:", url);

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        console.log("Dados recebidos:", data);
        setTransactions(data.transactions);
        setTotalPages(data.pagination.totalPages);

        // Garantir que a página atual não exceda o total
        if (
          currentPage > data.pagination.totalPages &&
          data.pagination.totalPages > 0
        ) {
          setCurrentPage(data.pagination.totalPages);
        }
      } else {
        console.error("Erro ao buscar transações:", response.status);
      }
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reprocessar transações com erro
  const handleReprocessErrors = async () => {
    if (stats.errors === 0) return;

    try {
      setIsReprocessing(true);

      // Buscar IDs das transações com erro
      const errorTransactions = transactions.filter(
        (t) => t.status === "error"
      );
      const recordIds = errorTransactions.map((t) => t.id);

      console.log("Transações com erro encontradas:", errorTransactions.length);
      console.log("IDs para reprocessamento:", recordIds);

      if (recordIds.length === 0) {
        toast({
          title: "Nenhuma transação com erro",
          description: "Não há transações com erro para reprocessar.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/imports/${jobId}/reprocess`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recordIds }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Reprocessamento iniciado:", result);

        // Atualizar estatísticas e transações
        await fetchStats();
        await fetchTransactions();

        // Mostrar mensagem de sucesso
        toast({
          title: "Reprocessamento iniciado",
          description: `Reprocessamento iniciado para ${recordIds.length} transações com erro.`,
        });
      } else {
        const error = await response.json();
        console.error("Erro no reprocessamento:", error);
        toast({
          title: "Erro no reprocessamento",
          description:
            error.error || "Erro desconhecido ao iniciar reprocessamento",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao reprocessar:", error);
      toast({
        title: "Erro interno",
        description: "Erro interno ao reprocessar transações",
        variant: "destructive",
      });
    } finally {
      setIsReprocessing(false);
    }
  };

  // Carregar dados quando a página carregar
  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, [jobId]);

  // Recarregar transações quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1); // Reset para primeira página
    fetchTransactions();
  }, [statusFilter, searchTerm]);

  // Recarregar transações quando página mudar
  useEffect(() => {
    if (currentPage >= 1) {
      fetchTransactions();
    }
  }, [currentPage]);

  // Não precisamos mais filtrar no frontend, pois a API já retorna os dados filtrados
  const currentTransactions = transactions;

  const getStatusIcon = (status: ImportedTransaction["status"]) => {
    switch (status) {
      case "imported":
        return <Check className="h-4 w-4 text-green-600" />;
      case "skipped":
        return <Warning className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <X className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-gray-600" />;
      case "processing":
        return <ArrowClockwise className="h-4 w-4 text-blue-600" />;
      default:
        return <Question className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: ImportedTransaction["status"]) => {
    switch (status) {
      case "imported":
        return "Importada";
      case "skipped":
        return "Ignorada";
      case "error":
        return "Erro";
      case "pending":
        return "Pendente";
      case "processing":
        return "Processando";
      default:
        return "Desconhecido";
    }
  };

  const getStatusColor = (status: ImportedTransaction["status"]) => {
    switch (status) {
      case "imported":
        return "bg-green-100 text-green-800 border border-green-200";
      case "skipped":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border border-red-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Status
          </Button>
          <h1 className="text-3xl font-bold">Detalhes da Importação</h1>
          <p className="text-gray-600 mt-2 font-medium">Job ID: {jobId}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Filtradas
          </Button>
          {stats.errors > 0 && (
            <>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Relatório de Erros
              </Button>
              <Button
                variant="outline"
                onClick={handleReprocessErrors}
                disabled={isReprocessing}
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                {isReprocessing ? (
                  <>
                    <ArrowClockwise className="h-4 w-4 mr-2 animate-spin" />
                    Reprocessando...
                  </>
                ) : (
                  <>
                    <ArrowClockwise className="h-4 w-4 mr-2" />
                    Reprocessar Erros ({stats.errors})
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Importação</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="animate-pulse bg-gray-200 h-8 w-16 mx-auto mb-2 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 w-20 mx-auto rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {stats.total.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 font-medium">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stats.imported.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 font-medium">Importadas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.skipped.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 font-medium">Ignoradas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {stats.errors.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 font-medium">Com Erro</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtros e Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Transações ({stats.total.toLocaleString()})</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 min-w-0">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Pesquisar por descrição ou envelope..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 flex-shrink-0">
                <Warning className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="imported">Importadas</SelectItem>
                <SelectItem value="skipped">Ignoradas</SelectItem>
                <SelectItem value="error">Com Erro</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="processing">Processando</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando transações...</p>
              </div>
            </div>
          ) : currentTransactions.length > 0 ? (
            <div className="space-y-4">
              {currentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`flex flex-row lg:flex-col lg:items-center justify-between p-4 gap-4 border rounded-lg ${
                    transaction.status === "error"
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 w-full">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusIcon(transaction.status)}
                      <Badge className={getStatusColor(transaction.status)}>
                        {getStatusText(transaction.status)}
                      </Badge>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-4 min-w-0">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-600 font-medium">
                            Data
                          </span>
                        </div>
                        <p className="font-medium text-gray-900">
                          {new Date(transaction.date).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs text-gray-600 font-medium">
                            Descrição
                          </span>
                        </div>
                        <p className="font-medium text-gray-900 break-words min-w-0">
                          {transaction.description}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <CurrencyDollar className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-600 font-medium">
                            Valor
                          </span>
                        </div>
                        <p
                          className={`font-medium ${
                            transaction.amount > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(Math.abs(transaction.amount))}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs text-gray-600 font-medium">
                            Envelope
                          </span>
                        </div>
                        <p className="font-medium text-gray-900 break-words min-w-0">
                          {transaction.envelope || "-"}
                        </p>
                      </div>

                      {transaction.rowNumber && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs text-gray-600 font-medium">
                              Linha
                            </span>
                          </div>
                          <p className="font-medium text-gray-900">
                            {transaction.rowNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mensagem de erro */}
                  {transaction.errorMessage && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg max-w-full w-full">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-sm text-red-700 break-words"
                            title={transaction.errorMessage}
                          >
                            {transaction.errorMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma transação encontrada</p>
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages} • Mostrando{" "}
                  {(currentPage - 1) * itemsPerPage + 1} a{" "}
                  {Math.min(currentPage * itemsPerPage, stats.total)} de{" "}
                  {stats.total} transações
                </p>
              </div>

              <Pagination>
                <PaginationContent>
                  {/* Botão Anterior */}
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

                  {/* Primeira página */}
                  {currentPage > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(1)}
                          className="cursor-pointer"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <span className="px-4 py-2">...</span>
                      </PaginationItem>
                    </>
                  )}

                  {/* Páginas ao redor da página atual */}
                  {(() => {
                    const startPage = Math.max(1, currentPage - 1);
                    const endPage = Math.min(totalPages, currentPage + 1);

                    const pages = [];
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(i);
                    }

                    return pages.map((pageNumber) => (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber)}
                          isActive={currentPage === pageNumber}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    ));
                  })()}

                  {/* Última página */}
                  {currentPage < totalPages - 2 && (
                    <>
                      <PaginationItem>
                        <span className="px-4 py-2">...</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(totalPages)}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  {/* Botão Próximo */}
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
    </div>
  );
}
