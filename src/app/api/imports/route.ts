import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar todos os jobs do usuário
    const importJobs = await prisma.importJob.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formatar para o formato esperado
    const formattedJobs = importJobs.map(job => ({
      id: job.id,
      filename: job.filename,
      status: job.status,
      totalRows: job.totalRows,
      processedRows: job.processedRows,
      importedRows: job.importedRows,
      errorRows: job.errorRows,
      createdAt: job.createdAt.toISOString(),
      finishedAt: job.finishedAt?.toISOString()
    }));

    return NextResponse.json(formattedJobs);

  } catch (error) {
    console.error("Erro ao buscar jobs:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
