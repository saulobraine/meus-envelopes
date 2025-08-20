"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Eye, Clock, Check, X, Warning } from "phosphor-react";
import { ImportTransactionsDialog } from "@/components/import/ImportTransactionsDialog";
import { formatCurrency } from "@/lib/currency";

interface ImportJob {
  id: string;
  filename: string;
  status: string;
  totalRows: number;
  processedRows: number;
  importedRows: number;
  errorRows: number;
  createdAt: string;
  finishedAt?: string;
}

export default function ImportacoesPage() {
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchImportJobs();
  }, []);

  const fetchImportJobs = async () => {
    try {
      const response = await fetch('/api/imports');
      if (response.ok) {
        const data = await response.json();
        setImportJobs(data);
      } else {
        console.error('Erro ao buscar importações');
      }
    } catch (error) {
      console.error("Erro ao buscar importações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      QUEUED: { label: "Na fila", variant: "secondary", icon: Clock },
      RUNNING: { label: "Processando", variant: "default", icon: Clock },
      COMPLETED: { label: "Concluído", variant: "default", icon: Check },
      FAILED: { label: "Falhou", variant: "destructive", icon: X },
      CANCELED: { label: "Cancelado", variant: "secondary", icon: Warning }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.QUEUED;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Importações</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas importações de transações
          </p>
        </div>
        <ImportTransactionsDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen}
          onImportStarted={(jobId) => {
            setIsDialogOpen(false);
            // Redirecionar para página de progresso
            window.location.href = `/transacoes/importacoes/${jobId}`;
          }}
        />
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Importação
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Importações</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : importJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma importação encontrada
            </div>
          ) : (
            <div className="space-y-4">
              {importJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{job.filename}</h3>
                      {getStatusBadge(job.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Criado em {formatDate(job.createdAt)}
                      {job.finishedAt && ` • Concluído em ${formatDate(job.finishedAt)}`}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span>Total: {job.totalRows}</span>
                      <span className="text-green-600">Importadas: {job.importedRows}</span>
                      {job.errorRows > 0 && (
                        <span className="text-red-600">Erros: {job.errorRows}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/transacoes/importacoes/${job.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalhes
                      </a>
                    </Button>
                    {job.errorRows > 0 && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Relatório de Erros
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
