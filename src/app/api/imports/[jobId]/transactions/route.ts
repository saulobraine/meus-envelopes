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
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    // Validar parâmetros
    if (isNaN(page) || isNaN(limit)) {
      return NextResponse.json(
        { error: "Parâmetros de paginação inválidos" },
        { status: 400 }
      );
    }

    if (
      ![
        "all",
        "imported",
        "error",
        "skipped",
        "pending",
        "processing",
      ].includes(status)
    ) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

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

    // Construir filtros base
    const baseFilters = {
      jobId: jobId,
    };

    // Filtros de status
    let statusFilters: any = {};
    if (status !== "all") {
      statusFilters.status = status.toUpperCase();
    }

    // Filtros de busca
    let searchFilters: any = {};
    if (search && search.trim()) {
      searchFilters.OR = [
        { description: { contains: search.trim(), mode: "insensitive" } },
        { envelope: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    // Combinar todos os filtros
    const where: any = { ...baseFilters };
    if (Object.keys(statusFilters).length > 0) {
      where.AND = [statusFilters];
    }
    if (Object.keys(searchFilters).length > 0) {
      if (where.AND) {
        where.AND.push(searchFilters);
      } else {
        where.AND = [searchFilters];
      }
    }

    // Log dos filtros para debug
    console.log("Filtros aplicados:", JSON.stringify(where, null, 2));

    // Buscar registros de importação
    const importRecords = await prisma.importRecord.findMany({
      where,
      orderBy: {
        rowNumber: "asc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Contar total
    const total = await prisma.importRecord.count({ where });

    // Log dos resultados para debug
    console.log(
      `Encontrados ${importRecords.length} registros de ${total} total`
    );

    // Formatar registros para o formato esperado
    const formattedTransactions = importRecords.map((record) => {
      // Determinar status baseado no registro
      let transactionStatus:
        | "imported"
        | "error"
        | "skipped"
        | "pending"
        | "processing" = record.status.toLowerCase() as any;
      let errorMessage: string | undefined = record.errorMessage;

      // Formatar dados
      const formattedRecord = {
        id: record.id,
        status: transactionStatus,
        date: record.date ? record.date.toISOString().split("T")[0] : "-",
        description: record.description || "-",
        amount: record.amount || 0,
        envelope: record.envelope || "Remuneração",
        errorMessage,
        rawData: record.rawData,
        rowNumber: record.rowNumber,
        processedAt: record.processedAt,
      };

      return formattedRecord;
    });

    return NextResponse.json({
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar registros de importação:", error);

    // Log mais detalhado para debug
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
      return NextResponse.json(
        { error: `Erro interno: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
