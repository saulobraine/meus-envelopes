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
    const { columnMapping, fileContent } = body;

    if (!columnMapping || !fileContent) {
      return NextResponse.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }

    // Verificar se o job existe e pertence ao usuário
    const existingJob = await prisma.importJob.findFirst({
      where: {
        id: jobId,
        userId: user.id,
      },
    });

    if (!existingJob) {
      return NextResponse.json(
        { error: "Job não encontrado" },
        { status: 404 }
      );
    }

    // Processar o arquivo
    const lines = fileContent.split("\n").filter((line: string) => line.trim());
    const totalRows = lines.length - 1; // Excluir cabeçalho

    // Atualizar o job com o total de linhas
    await prisma.importJob.update({
      where: { id: jobId },
      data: {
        totalRows,
        status: "RUNNING",
        startedAt: new Date(),
      },
    });

    // Criar evento de início do processamento
    await prisma.importEvent.create({
      data: {
        jobId,
        type: "LOG",
        message: `Iniciando processamento de ${totalRows} linhas`,
        data: { totalRows, columnMapping },
      },
    });

    // Simular processamento em background
    setTimeout(async () => {
      await processImportJob(jobId, lines, columnMapping, user.id);
    }, 1000);

    return NextResponse.json({
      jobId,
      status: "RUNNING",
      message: "Processamento iniciado",
      totalRows,
    });
  } catch (error) {
    console.error("Erro ao confirmar importação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função para fazer parse correto de CSV com aspas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

async function processImportJob(
  jobId: string,
  lines: string[],
  columnMapping: any,
  userId: string
) {
  try {
    const headers = parseCSVLine(lines[0]);
    const dataLines = lines.slice(1);
    let processedRows = 0;
    let importedRows = 0;
    let errorRows = 0;
    let skippedRows = 0;

    // Primeiro, criar registros para todas as linhas
    const importRecords = [];
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const values = parseCSVLine(line);
      const rowData: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] || "";
      });

      const record = await prisma.importRecord.create({
        data: {
          jobId,
          rowNumber: i + 1,
          rawData: rowData,
          status: "PENDING",
          // Salvar dados processados iniciais se disponíveis
          date: rowData[columnMapping.date]
            ? parseBrazilianDate(rowData[columnMapping.date])
            : null,
          description: rowData[columnMapping.description] || null,
          amount: rowData[columnMapping.amount]
            ? (() => {
                const amountStr = rowData[columnMapping.amount];
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
            : null,
          envelope: rowData[columnMapping.envelope] || null,
        },
      });
      importRecords.push(record);
    }

    // Processar cada linha
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const record = importRecords[i];

      try {
        // Atualizar status para PROCESSING
        await prisma.importRecord.update({
          where: { id: record.id },
          data: { status: "PROCESSING" },
        });

        const values = parseCSVLine(line);
        const rowData: Record<string, string> = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index] || "";
        });

        const date = rowData[columnMapping.date];
        const description = rowData[columnMapping.description];
        const amountStr = rowData[columnMapping.amount];
        const envelope = columnMapping.envelope
          ? rowData[columnMapping.envelope]
          : undefined;

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

          errorRows++;
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

          errorRows++;
          continue;
        }

        // Buscar ou criar envelope baseado na coluna selecionada
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
                  mode: "insensitive", // Case insensitive
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

          skippedRows++;
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

        importedRows++;

        // Log de progresso a cada 100 linhas
        if (importedRows % 100 === 0) {
          await prisma.importEvent.create({
            data: {
              jobId,
              type: "PROGRESS",
              message: `${importedRows} transações importadas com sucesso`,
              data: { importedRows, processedRows: processedRows + 1 },
            },
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";

        await prisma.importRecord.update({
          where: { id: record.id },
          data: {
            status: "ERROR",
            errorMessage: `Erro no processamento: ${errorMessage}`,
            processedAt: new Date(),
          },
        });

        errorRows++;
      }

      processedRows++;

      // Atualizar progresso a cada 50 linhas
      if (processedRows % 50 === 0) {
        await prisma.importJob.update({
          where: { id: jobId },
          data: {
            processedRows,
            importedRows,
            errorRows,
            skippedRows,
          },
        });
      }
    }

    // Finalizar o job
    await prisma.importJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        processedRows,
        importedRows,
        errorRows,
        skippedRows,
        finishedAt: new Date(),
      },
    });

    await prisma.importEvent.create({
      data: {
        jobId,
        type: "LOG",
        message: `Importação concluída: ${importedRows} importadas, ${errorRows} com erro, ${skippedRows} ignoradas`,
        data: {
          importedRows,
          errorRows,
          skippedRows,
          totalRows: processedRows,
        },
      },
    });
  } catch (error) {
    console.error("Erro no processamento:", error);
    await prisma.importJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
      },
    });

    await prisma.importEvent.create({
      data: {
        jobId,
        type: "ERROR",
        message: "Erro fatal no processamento",
        data: {
          error: error instanceof Error ? error.message : "Erro desconhecido",
        },
      },
    });
  }
}
