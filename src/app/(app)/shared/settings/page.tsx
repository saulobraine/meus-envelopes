import { Suspense } from "react";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export default function SharedSettingsPageWrapper() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SharedSettingsPageContent />
    </Suspense>
  );
}

async function SharedSettingsPageContent() {
  await getAuthenticatedUser();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Configurações da Conta</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta compartilhada
        </p>
      </div>

      <div className="p-8 text-center">
        <p className="text-lg text-muted-foreground">
          Página de configurações em desenvolvimento
        </p>
      </div>
    </div>
  );
}
