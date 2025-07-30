"use client";

import { resetarImportacao } from "@/app/_actions/importarTransacoes";
import { Button } from "@/components/ui/button";
import type { ImportSession } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

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
        <div
          key={session.id}
          className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-black"
        >
          <div className="grid grid-cols-4 gap-4 items-center">
            <Link
              href={`/importacoes/${session.id}`}
              className="col-span-3 space-y-2 opacity-90 hover:opacity-100 p-2 rounded"
            >
              <h3 className="font-medium text-lg">{session.fileName}</h3>
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
              <p className="text-sm text-muted-foreground">
                Importado em: {new Date(session.createdAt).toLocaleString()}
              </p>
            </Link>
            <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={() => handleReset(session.id)}
                disabled={isPending}
              >
                {isPending ? "Resetando..." : "Resetar"}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
