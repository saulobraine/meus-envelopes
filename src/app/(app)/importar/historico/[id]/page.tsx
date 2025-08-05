import { prisma } from "@/lib/prisma";
import { ImportDetailClient } from "@/app/importacoes/[id]/import-detail-client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function getSession(id: string, userId: string) {
  const session = await prisma.importSession.findUnique({
    where: { id, userId },
    include: { previewItems: { orderBy: { id: "asc" } } },
  });
  return session;
}

export default async function ImportacaoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const session = await getSession(params.id, user.id);

  if (!session) {
    return <div>Sessão de importação não encontrada.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Detalhes da Importação</h1>
      <ImportDetailClient initialSession={session} />
    </div>
  );
}
