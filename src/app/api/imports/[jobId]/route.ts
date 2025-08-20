import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { user } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { jobId } = await params;

    // Buscar o job com eventos
    const importJob = await prisma.importJob.findFirst({
      where: {
        id: jobId,
        userId: user.id,
      },
      include: {
        events: {
          orderBy: {
            createdAt: "desc",
          },
          take: 20, // Últimos 20 eventos
        },
      },
    });

    if (!importJob) {
      return NextResponse.json(
        { error: "Job não encontrado" },
        { status: 404 }
      );
    }

    // Formatar os logs para compatibilidade
    const logs = importJob.events.map((event) => event.message);

    return NextResponse.json({
      id: importJob.id,
      filename: importJob.filename,
      status: importJob.status,
      totalRows: importJob.totalRows,
      processedRows: importJob.processedRows,
      importedRows: importJob.importedRows,
      errorRows: importJob.errorRows,
      startedAt: importJob.startedAt,
      finishedAt: importJob.finishedAt,
      logs,
      events: importJob.events,
    });
  } catch (error) {
    console.error("Erro ao buscar job:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
