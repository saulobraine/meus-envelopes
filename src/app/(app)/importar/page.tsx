"use client";

import { importarTransacoes } from "@/app/_actions/transaction/import";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/client"; // Import createClient
import Link from "next/link"; // Import Link
import type { ImportSession } from "@prisma/client"; // Import ImportSession type

export default function ImportarPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentSessions, setRecentSessions] = useState<ImportSession[]>([]); // State for recent sessions
  const [isLoadingSessions, setIsLoadingSessions] = useState(true); // State for loading sessions

  // Fetch recent sessions
  useEffect(() => {
    const fetchRecentSessions = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Usuário não autenticado");
        setIsLoadingSessions(false);
        return;
      }

      try {
        // Fetch last 5 sessions
        // Assumindo que uma rota de API /api/import-sessions existe para buscar as sessões
        const response = await fetch("/api/import-sessions?limit=5");
        if (!response.ok) throw new Error("Falha ao buscar sessões recentes");
        const data = await response.json();
        setRecentSessions(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchRecentSessions();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        let transactions: any[] = [];

        if (file.name.endsWith(".csv")) {
          Papa.parse(data as string, {
            header: true,
            transformHeader: (header) =>
              header.replace(/DESCRIÃ‡ÃƒO/g, "DESCRIÇÃO"),
            skipEmptyLines: true,
            encoding: "UTF-8",
            complete: (results) => {
              transactions = results.data;
              handleImport(transactions);
            },
            error: (err: any) => {
              setError(err.message);
            },
          });
        } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json: any[] = XLSX.utils.sheet_to_json(worksheet);

          // Converter datas do Excel e garantir que todos os valores são strings
          transactions = json.map((row) => {
            const newRow: { [key: string]: string } = {};
            for (const key in row) {
              if (key === "DATA" && typeof row[key] === "number") {
                // Converte o número de série da data do Excel para um objeto Date
                const date = XLSX.SSF.parse_date_code(row[key]);
                // Formata a data como dd/mm/yyyy
                newRow[key] =
                  `${String(date.d).padStart(2, "0")}/${String(date.m).padStart(2, "0")}/${date.y}`;
              } else {
                newRow[key] = String(row[key]);
              }
            }
            return newRow;
          });

          handleImport(transactions);
        } else {
          setError("Formato de arquivo não suportado.");
          return;
        }
      } catch (err) {
        setError((err as Error).message);
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file, "UTF-8");
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleImport = async (transactions: any[]) => {
    try {
      const res = await importarTransacoes(transactions);
      setResult(res);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setResult(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Importar Transações</h1>
      <div className="flex flex-col gap-4 max-w-md">
        <Input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
        />
        <Button onClick={handleSubmit} disabled={!file}>
          Importar
        </Button>
        {result && (
          <div className="p-4 bg-green-100 rounded-md">
            <p>Importação concluída!</p>
            <p>Sessão: {result.importSessionId}</p>
            <p>Importadas: {result.importedCount}</p>
            <p>Duplicadas: {result.duplicateCount}</p>
            <p>Erros: {result.errorCount}</p>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-100 rounded-md">
            <p>Erro: {error}</p>
          </div>
        )}
      </div>

      {/* Section for recent imports */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Últimas 5 Importações</h2>
          <Link href="/importar/historico">
            <Button variant="outline">Ver todas</Button>
          </Link>
        </div>
        {isLoadingSessions ? (
          <p>Carregando importações...</p>
        ) : error ? (
          <p className="text-red-500">Erro ao carregar importações: {error}</p>
        ) : recentSessions.length === 0 ? (
          <p>Nenhuma importação recente encontrada.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {recentSessions.map((session) => (
              <div key={session.id} className="p-4 border rounded-md">
                <p>Arquivo: {session.fileName}</p>
                <p>Data: {new Date(session.createdAt).toLocaleString()}</p>
                <p>Pendentes: {session.importedCount}</p>
                <p>Duplicadas: {session.ignoredCount}</p>
                <p>Erros: {session.errorCount}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
