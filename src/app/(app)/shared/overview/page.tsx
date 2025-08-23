import { Suspense } from "react";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export default function SharedOverviewPageWrapper() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SharedOverviewPageContent />
    </Suspense>
  );
}

async function SharedOverviewPageContent() {
  await getAuthenticatedUser();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Visão Geral da Conta Compartilhada
        </h1>
        <p className="text-muted-foreground">
          Gerencie e visualize o status financeiro da sua conta compartilhada
        </p>
      </div>

      <div className="p-8 text-center">
        <p className="text-lg text-muted-foreground">
          Página de visão geral em desenvolvimento
        </p>
      </div>
    </div>
  );
}
