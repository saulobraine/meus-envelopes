"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Clock,
  Check,
  X,
  Warning,
  Download,
  Eye,
} from "phosphor-react";

interface ImportJob {
  id: string;
  filename: string;
  status: string;
  totalRows: number;
  processedRows: number;
  importedRows: number;
  errorRows: number;
  startedAt?: string;
  logs: string[];
}

export default function ImportProgressPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<ImportJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    fetchJobDetails();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/imports/${jobId}`);
      if (response.ok) {
        const jobData = await response.json();
        setJob(jobData);
        setProgress((jobData.processedRows / jobData.totalRows) * 100);
      } else {
        console.error("Erro ao buscar detalhes do job");
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do job:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = () => {
    if (job && job.status === "RUNNING") {
      // Simular progresso incremental
      setProgress((prev) => Math.min(prev + Math.random() * 2, 100));
      setElapsedTime((prev) => prev + 1);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      QUEUED: { label: "Na fila", variant: "secondary", icon: Clock },
      RUNNING: { label: "Processando", variant: "default", icon: Clock },
      COMPLETED: { label: "Concluído", variant: "default", icon: Check },
      FAILED: { label: "Falhou", variant: "destructive", icon: X },
      CANCELED: { label: "Cancelado", variant: "secondary", icon: Warning },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.QUEUED;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!job) {
    return (
      <Alert variant="destructive">
        <X className="h-4 w-4" />
        <AlertDescription>Job de importação não encontrado</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Importação em Andamento</h1>
          <p className="text-muted-foreground mt-2">{job.filename}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>{getStatusBadge(job.status)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(progress)}%</div>
            <Progress value={progress} className="mt-2" />
            <div className="text-sm text-muted-foreground mt-1">
              {job.processedRows} de {job.totalRows} linhas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tempo Decorrido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(elapsedTime)}</div>
            <div className="text-sm text-muted-foreground">
              Iniciado há {formatTime(elapsedTime)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Linhas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{job.totalRows}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {job.processedRows}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Importadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {job.importedRows}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Com Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {job.errorRows}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs em Tempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            {job.logs && job.logs.length > 0 ? (
              job.logs.map((log, index) => (
                <div
                  key={index}
                  className="mb-2 p-2 bg-gray-800 rounded border-l-2 border-green-500"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-xs">
                      [{new Date().toLocaleTimeString()}]
                    </span>
                    <span className="text-gray-100">{log}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-8">
                Nenhum log disponível ainda...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {job.status === "COMPLETED" && (
        <div className="flex justify-center gap-4">
          <Button
            onClick={() =>
              router.push(`/transacoes/importacoes/${job.id}/detalhes`)
            }
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalhes
          </Button>
          {job.errorRows > 0 && (
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Baixar Relatório de Erros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
