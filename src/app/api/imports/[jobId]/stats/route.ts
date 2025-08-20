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

    // Verificar se o job existe e pertence ao usuário
    const importJob = await prisma.importJob.findFirst({
      where: {
        id: jobId,
        userId: user.id,
      },
    });

    if (!importJob) {
      return NextResponse.json(
        { error: "Job não encontrado" },
        { status: 404 }
      );
    }

    // Buscar estatísticas dos registros de importação
    const totalRecords = await prisma.importRecord.count({
      where: {
        jobId: jobId,
      },
    });

    const importedRecords = await prisma.importRecord.count({
      where: {
        jobId: jobId,
        status: "IMPORTED",
      },
    });

    const errorRecords = await prisma.importRecord.count({
      where: {
        jobId: jobId,
        status: "ERROR",
      },
    });

    const skippedRecords = await prisma.importRecord.count({
      where: {
        jobId: jobId,
        status: "SKIPPED",
      },
    });

    const pendingRecords = await prisma.importRecord.count({
      where: {
        jobId: jobId,
        status: "PENDING",
      },
    });

    const processingRecords = await prisma.importRecord.count({
      where: {
        jobId: jobId,
        status: "PROCESSING",
      },
    });

    // Buscar eventos de erro para mensagens detalhadas
    const errorEvents = await prisma.importEvent.findMany({
      where: {
        jobId,
        type: "ERROR",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // Últimos 10 erros
    });

    return NextResponse.json({
      total: totalRecords,
      imported: importedRecords,
      errors: errorRecords,
      skipped: skippedRecords,
      pending: pendingRecords,
      processing: processingRecords,
      errorEvents: errorEvents.map((event) => ({
        message: event.message,
        data: event.data,
        createdAt: event.createdAt,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
