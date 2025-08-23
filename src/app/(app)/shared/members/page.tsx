import { Suspense } from "react";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export default function SharedMembersPageWrapper() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SharedMembersPageContent />
    </Suspense>
  );
}

async function SharedMembersPageContent() {
  await getAuthenticatedUser();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Membros da Conta</h1>
        <p className="text-muted-foreground">
          Gerencie os membros da sua conta compartilhada
        </p>
      </div>

      <div className="p-8 text-center">
        <p className="text-lg text-muted-foreground">
          Página de membros em desenvolvimento
        </p>
      </div>
    </div>
  );
}
