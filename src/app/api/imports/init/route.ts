import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { filename, mimeType, size } = body;

    if (!filename || !mimeType || !size) {
      return NextResponse.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }

    // Criar o job de importação
    const importJob = await prisma.importJob.create({
      data: {
        userId: user.id,
        filename,
        mimeType,
        size,
        status: "QUEUED",
        totalRows: 0,
        processedRows: 0,
        importedRows: 0,
        errorRows: 0,
        logs: []
      }
    });

    // Criar evento inicial
    await prisma.importEvent.create({
      data: {
        jobId: importJob.id,
        type: "LOG",
        message: "Job de importação criado com sucesso",
        data: { filename, mimeType, size }
      }
    });

    return NextResponse.json({
      jobId: importJob.id,
      status: "QUEUED",
      message: "Job de importação criado com sucesso"
    });

  } catch (error) {
    console.error("Erro ao criar job de importação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
