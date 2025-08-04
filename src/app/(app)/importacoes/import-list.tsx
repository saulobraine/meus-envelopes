"use client";

import { resetarImportacao } from "@/app/_actions/transaction/import";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import type { ImportSession } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

interface ImportListProps {
  sessions: ImportSession[];
}

export function ImportList({ sessions }: ImportListProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleReset = async (sessionId: string) => {
    startTransition(async () => {
      try {
        await resetarImportacao(sessionId);
        router.refresh();
      } catch (error) {
        console.error("Falha ao resetar importação:", error);
        // Adicionar feedback de erro para o usuário aqui
      }
    });
  };

  if (sessions.length === 0) {
    return <p>Nenhuma importação encontrada.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {sessions.map((session) => (
        <Collapsible
          key={session.id}
          className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-black"
        >
          <div className="flex items-center justify-between">
            <Link
              href={`/importacoes/${session.id}`}
              className="flex-grow space-y-2 opacity-90 hover:opacity-100 p-2 rounded"
            >
              <h3 className="font-medium text-lg">{session.fileName}</h3>
              <p className="text-sm text-muted-foreground">
                Importado em: {new Date(session.createdAt).toLocaleString()}
              </p>
            </Link>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                <ChevronsUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-2 pt-4">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>{session.importedCount} Pendentes</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span>{session.ignoredCount} Duplicadas</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>{session.errorCount} Erros</span>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={() => handleReset(session.id)}
                disabled={isPending}
              >
                {isPending ? "Resetando..." : "Resetar"}
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
