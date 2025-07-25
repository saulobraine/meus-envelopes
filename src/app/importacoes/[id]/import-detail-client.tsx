"use client";

import { useState } from "react";
import { resolverDuplicata } from "@/app/_actions/resolverDuplicatas";
import { editarStatusTransacao } from "@/app/_actions/editarStatusTransacao";
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
            <div className="flex items-center gap-2 mb-2">
              <span>Status:</span>
              <select
                value={item.status}
                onChange={async (e) => {
                  const newStatus = e.target.value as typeof item.status;
                  try {
                    await editarStatusTransacao(item.id, newStatus);
                    // Atualiza o status localmente
                    setSession((prev) => ({
                      ...prev,
                      previewItems: prev.previewItems.map((preview) =>
                        preview.id === item.id
                          ? { ...preview, status: newStatus }
                          : preview
                      ),
                    }));
                  } catch (error) {
                    alert(`Erro ao atualizar: ${(error as Error).message}`);
                  }
                }}
                className={`px-2 py-1 rounded-md text-sm ${
                  item.status === "NEW"
                    ? "bg-gray-100 text-gray-800"
                    : item.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : item.status === "DUPLICATE"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                }`}
              >
                <option value="PENDING">Pendente</option>
                <option value="DUPLICATE">Duplicada</option>
                <option value="ERROR">Erro</option>
                <option value="NEW">Novo</option>
              </select>
            </div>
            <pre className="bg-amber-600 p-2 rounded-md">
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
