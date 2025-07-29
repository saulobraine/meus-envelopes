"use client";

import { useState } from "react";
import { resolverDuplicata } from "@/app/_actions/resolveDuplicates";
import type { ImportSession, ImportTransactionPreview } from "@prisma/client";

type SessionWithPreview = ImportSession & {
  previewItems: ImportTransactionPreview[];
};

interface ImportDetailClientProps {
  initialSession: SessionWithPreview;
}

export function ImportDetailClient({
  initialSession,
}: ImportDetailClientProps) {
  const [session, setSession] = useState(initialSession);

  const handleResolve = async (previewId: string, action: "ADD" | "IGNORE") => {
    try {
      await resolverDuplicata({ previewId, action });
      // Atualiza a UI removendo o item resolvido
      setSession((prev) => ({
        ...prev,
        previewItems: prev.previewItems.filter((item) => item.id !== previewId),
      }));
    } catch (error) {
      alert(`Erro ao resolver: ${(error as Error).message}`);
    }
  };

  return (
    <>
      <div className="p-4 border rounded-md mb-4">
        <p>Arquivo: {session.fileName}</p>
        <p>Data: {new Date(session.createdAt).toLocaleString()}</p>
        <p>Importadas: {session.importedCount}</p>
        <p>
          Duplicadas:{" "}
          {session.previewItems.filter((p) => p.status === "DUPLICATE").length}
        </p>
        <p>Erros: {session.errorCount}</p>
      </div>

      <h2 className="text-xl font-bold mb-2">Itens Pendentes</h2>
      <div className="flex flex-col gap-4">
        {session.previewItems.map((item) => (
          <div key={item.id} className="p-4 border rounded-md">
            <p>Status: {item.status}</p>
            <pre className="bg-gray-100 p-2 rounded-md">
              {JSON.stringify(item.data, null, 2)}
            </pre>
            {item.status === "DUPLICATE" && !item.resolved && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleResolve(item.id, "ADD")}
                  className="px-4 py-2 bg-green-500 text-white rounded-md"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => handleResolve(item.id, "IGNORE")}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md"
                >
                  Ignorar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
