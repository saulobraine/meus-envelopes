import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { parseBrazilianDate } from "@/lib/utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { user } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { jobId } = await params;
    const body = await request.json();
    const { recordIds } = body; // IDs dos registros para reprocessar

    console.log("[Reprocess] Body recebido:", body);
    console.log("[Reprocess] recordIds:", recordIds);
    console.log("[Reprocess] Tipo de recordIds:", typeof recordIds);
    console.log("[Reprocess] É array?", Array.isArray(recordIds));

    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      console.log("[Reprocess] ❌ Validação falhou - recordIds inválido");
      return NextResponse.json(
        { error: "IDs dos registros não fornecidos" },
        { status: 400 }
      );
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

    // Buscar os registros para reprocessar
    const recordsToReprocess = await prisma.importRecord.findMany({
      where: {
        id: { in: recordIds },
        jobId: jobId,
        status: "ERROR", // Apenas registros com erro
      },
    });

    if (recordsToReprocess.length === 0) {
      return NextResponse.json(
        { error: "Nenhum registro com erro encontrado para reprocessar" },
        { status: 400 }
      );
    }

    // Resetar status dos registros para PENDING para reprocessamento
    await prisma.importRecord.updateMany({
      where: {
        id: { in: recordIds },
        jobId: jobId,
        status: "ERROR",
      },
      data: {
        status: "PENDING",
        errorMessage: null,
        processedAt: null,
        transactionId: null,
      },
    });

    // Criar evento de reprocessamento iniciado
    await prisma.importEvent.create({
      data: {
        jobId,
        type: "LOG",
        message: `Reprocessamento iniciado para ${recordsToReprocess.length} registros`,
        data: { totalReprocessed: recordsToReprocess.length },
      },
    });

    // Simular processamento em background (reutiliza a lógica existente)
    setTimeout(async () => {
      try {
        // Buscar o job com os dados originais para reprocessamento
        const jobToReprocess = await prisma.importJob.findFirst({
          where: { id: jobId },
          include: { events: true },
        });

        if (jobToReprocess) {
          // Encontrar o evento com o mapeamento de colunas original
          const mappingEvent = jobToReprocess.events.find(
            (event) =>
              event.type === "LOG" &&
              event.data &&
              (event.data as any).columnMapping
          );

          if (mappingEvent) {
            const columnMapping = (mappingEvent.data as any).columnMapping;

            // Buscar todos os registros PENDING para reprocessar
            const pendingRecords = await prisma.importRecord.findMany({
              where: {
                jobId: jobId,
                status: "PENDING",
              },
              orderBy: { rowNumber: "asc" },
            });

            // Reprocessar usando a mesma lógica da API de confirmação
            await reprocessRecords(
              jobId,
              pendingRecords,
              columnMapping,
              user.id
            );
          }
        }
      } catch (error) {
        console.error("Erro no reprocessamento em background:", error);

        await prisma.importEvent.create({
          data: {
            jobId,
            type: "ERROR",
            message: "Erro no reprocessamento em background",
            data: {
              error:
                error instanceof Error ? error.message : "Erro desconhecido",
            },
          },
        });
      }
    }, 1000);

    return NextResponse.json({
      success: true,
      message: `Reprocessamento iniciado para ${recordsToReprocess.length} registros`,
      totalReprocessed: recordsToReprocess.length,
    });
  } catch (error) {
    console.error("Erro ao iniciar reprocessamento:", error);

    if (error instanceof Error) {
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

// Função auxiliar para reprocessar registros (reutiliza lógica existente)
async function reprocessRecords(
  jobId: string,
  records: any[],
  columnMapping: any,
  userId: string
) {
  let reprocessedCount = 0;
  let errorCount = 0;

  for (const record of records) {
    try {
      // Atualizar status para PROCESSING
      await prisma.importRecord.update({
        where: { id: record.id },
        data: { status: "PROCESSING" },
      });

      const rawData = record.rawData as any;

      // Extrair dados do registro original usando o mapeamento
      const date = rawData[columnMapping.date] || "";
      const description = rawData[columnMapping.description] || "";
      const amountStr = rawData[columnMapping.amount] || "0";
      const envelope = columnMapping.envelope
        ? rawData[columnMapping.envelope]
        : undefined;

      // Atualizar dados processados se necessário
      await prisma.importRecord.update({
        where: { id: record.id },
        data: {
          date: date ? parseBrazilianDate(date) : record.date,
          description: description || record.description,
          amount: amountStr
            ? (() => {
                let cleanAmountStr = amountStr.trim();
                const isNegative = cleanAmountStr.startsWith("-");
                if (isNegative) cleanAmountStr = cleanAmountStr.substring(1);

                cleanAmountStr = cleanAmountStr
                  .replace(/R\$/g, "")
                  .replace(/R/g, "")
                  .replace(/\s/g, "");

                if (
                  cleanAmountStr.includes(",") &&
                  cleanAmountStr.includes(".")
                ) {
                  cleanAmountStr = cleanAmountStr
                    .replace(/\./g, "")
                    .replace(/,/g, ".");
                } else if (
                  cleanAmountStr.includes(",") &&
                  !cleanAmountStr.includes(".")
                ) {
                  cleanAmountStr = cleanAmountStr.replace(/,/g, ".");
                }

                const amount = Math.round(parseFloat(cleanAmountStr) * 100);
                return isNegative ? -amount : amount;
              })()
            : record.amount,
          envelope: envelope || record.envelope,
        },
      });

      // Validar dados obrigatórios
      if (!date || !description || !amountStr) {
        const errorMessage = `Dados obrigatórios ausentes: ${[
          !date && "data",
          !description && "descrição",
          !amountStr && "valor",
        ]
          .filter(Boolean)
          .join(", ")}`;

        await prisma.importRecord.update({
          where: { id: record.id },
          data: {
            status: "ERROR",
            errorMessage,
            date: date ? parseBrazilianDate(date) : null,
            description: description || null,
            amount: null, // Não foi possível processar o valor
            envelope: null, // Não foi possível determinar o envelope
            processedAt: new Date(),
            // Não vincular transactionId para erros
          },
        });

        errorCount++;
        continue;
      }

      // Parser robusto de valor monetário brasileiro
      let cleanAmountStr = amountStr.trim();

      // Verificar se é negativo
      const isNegative = cleanAmountStr.startsWith("-");
      if (isNegative) {
        cleanAmountStr = cleanAmountStr.substring(1);
      }

      // Remover símbolos de moeda e espaços
      cleanAmountStr = cleanAmountStr
        .replace(/R\$/g, "") // Remove R$
        .replace(/R/g, "") // Remove R (sem $)
        .replace(/\s/g, ""); // Remove espaços

      // Tratar separadores de milhares e decimais
      if (cleanAmountStr.includes(",") && cleanAmountStr.includes(".")) {
        // Formato: 1.200,50 (ponto como milhares, vírgula como decimal)
        cleanAmountStr = cleanAmountStr
          .replace(/\./g, "") // Remove pontos (separador de milhares)
          .replace(/,/g, "."); // Substitui vírgula por ponto (separador decimal)
      } else if (
        cleanAmountStr.includes(",") &&
        !cleanAmountStr.includes(".")
      ) {
        // Formato: 1200,50 (apenas vírgula como decimal)
        cleanAmountStr = cleanAmountStr.replace(/,/g, ".");
      } else if (
        cleanAmountStr.includes(".") &&
        !cleanAmountStr.includes(",")
      ) {
        // Formato: 1200.50 (apenas ponto como decimal)
        // Manter como está
      }

      const amount = Math.round(parseFloat(cleanAmountStr) * 100);
      const finalAmount = isNegative ? -amount : amount;

      if (isNaN(finalAmount)) {
        await prisma.importRecord.update({
          where: { id: record.id },
          data: {
            status: "ERROR",
            errorMessage: `Valor inválido: "${amountStr}"`,
            processedAt: new Date(),
          },
        });

        errorCount++;
        continue;
      }

      // Buscar ou criar envelope (mesma lógica da API original)
      let targetEnvelope = null;

      if (envelope && envelope.trim()) {
        const envelopeName = envelope.trim();

        // Se o envelope for "Remuneração", usar o envelope global
        if (
          envelopeName.toLowerCase() === "remuneração" ||
          envelopeName.toLowerCase() === "remuneracao"
        ) {
          targetEnvelope = await prisma.envelope.findFirst({
            where: {
              isGlobal: true,
            },
          });
        } else {
          // Buscar envelope existente com o nome especificado
          targetEnvelope = await prisma.envelope.findFirst({
            where: {
              userId: userId,
              name: {
                equals: envelopeName,
                mode: "insensitive",
              },
            },
          });

          // Se não existir, criar um novo envelope personalizado
          if (!targetEnvelope) {
            targetEnvelope = await prisma.envelope.create({
              data: {
                name: envelopeName,
                userId: userId,
                value: 0,
                type: "MONETARY",
                isGlobal: false, // Envelope personalizado
                isDeletable: true,
              },
            });
          }
        }
      } else {
        // Se não há coluna de envelope, usar envelope padrão global
        targetEnvelope = await prisma.envelope.findFirst({
          where: {
            isGlobal: true,
          },
        });
      }

      // Garantir que sempre temos um envelope válido
      if (!targetEnvelope) {
        throw new Error(
          "Envelope global 'Remuneração' não encontrado. Verifique se o seed foi executado corretamente."
        );
      }

      // Verificar se já existe transação similar (duplicata)
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          userId,
          date: parseBrazilianDate(date),
          description,
          amount: finalAmount,
        },
      });

      if (existingTransaction) {
        // Mesmo sendo duplicada, salvar todas as informações possíveis
        await prisma.importRecord.update({
          where: { id: record.id },
          data: {
            status: "SKIPPED",
            errorMessage: "Transação duplicada",
            date: parseBrazilianDate(date),
            description,
            amount: finalAmount,
            envelope: targetEnvelope?.name || "Padrão",
            processedAt: new Date(),
            // Não vincular à transação existente para duplicatas
          },
        });

        continue;
      }

      // Criar transação
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          date: parseBrazilianDate(date),
          description,
          amount: finalAmount,
          type: finalAmount > 0 ? "INCOME" : "EXPENSE",
          envelopeId: targetEnvelope.id,
          status: "COMPLETED",
          importJobId: jobId,
        },
      });

      // Atualizar registro de importação
      await prisma.importRecord.update({
        where: { id: record.id },
        data: {
          status: "IMPORTED",
          date: parseBrazilianDate(date),
          description,
          amount: finalAmount,
          envelope: targetEnvelope.name,
          processedAt: new Date(),
          transactionId: transaction.id,
        },
      });

      reprocessedCount++;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      await prisma.importRecord.update({
        where: { id: record.id },
        data: {
          status: "ERROR",
          errorMessage: `Erro no reprocessamento: ${errorMessage}`,
          processedAt: new Date(),
        },
      });

      errorCount++;
    }
  }

  // Atualizar estatísticas do job
  const updatedStats = await prisma.importRecord.groupBy({
    by: ["status"],
    where: { jobId: jobId },
    _count: { status: true },
  });

  const stats = {
    imported:
      updatedStats.find((s) => s.status === "IMPORTED")?._count.status || 0,
    error: updatedStats.find((s) => s.status === "ERROR")?._count.status || 0,
    skipped:
      updatedStats.find((s) => s.status === "SKIPPED")?._count.status || 0,
    pending:
      updatedStats.find((s) => s.status === "PENDING")?._count.status || 0,
    processing:
      updatedStats.find((s) => s.status === "PROCESSING")?._count.status || 0,
  };

  await prisma.importJob.update({
    where: { id: jobId },
    data: {
      importedRows: stats.imported,
      errorRows: stats.error,
      skippedRows: stats.skipped,
    },
  });

  // Criar evento de conclusão do reprocessamento
  await prisma.importEvent.create({
    data: {
      jobId,
      type: "LOG",
      message: `Reprocessamento concluído: ${reprocessedCount} reprocessados, ${errorCount} com erro`,
      data: { reprocessedCount, errorCount, totalReprocessed: records.length },
    },
  });
}
