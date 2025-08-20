/**
 * Script para corrigir transações com valores negativos no banco
 *
 * Executa a migração de dados para o novo padrão:
 * - Valores sempre positivos no campo amount
 * - Tipo determina se é receita (INCOME) ou despesa (EXPENSE)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixNegativeAmounts() {
  console.log("🔧 Iniciando correção de valores negativos...");

  try {
    // Buscar todas as transações com valores negativos
    const negativeTransactions = await prisma.transaction.findMany({
      where: {
        amount: {
          lt: 0,
        },
      },
      include: {
        envelope: true,
      },
    });

    console.log(
      `📊 Encontradas ${negativeTransactions.length} transações com valores negativos`
    );

    if (negativeTransactions.length === 0) {
      console.log("✅ Nenhuma transação com valor negativo encontrada!");
      return;
    }

    let fixedCount = 0;
    let errorCount = 0;

    for (const transaction of negativeTransactions) {
      try {
        // Determinar o tipo correto baseado no valor atual
        const shouldBeExpense = transaction.amount < 0;
        const correctType = shouldBeExpense ? "EXPENSE" : "INCOME";
        const correctAmount = Math.abs(transaction.amount);

        // Atualizar a transação
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            amount: correctAmount,
            type: correctType,
          },
        });

        console.log(
          `✅ Corrigida: ${transaction.description} - ${transaction.amount} → ${correctAmount} (${correctType})`
        );
        fixedCount++;
      } catch (error) {
        console.error(
          `❌ Erro ao corrigir transação ${transaction.id}:`,
          error
        );
        errorCount++;
      }
    }

    console.log("\n📈 Resumo da correção:");
    console.log(`✅ Transações corrigidas: ${fixedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📊 Total processadas: ${negativeTransactions.length}`);

    // Verificar se ainda há transações negativas
    const remainingNegative = await prisma.transaction.count({
      where: {
        amount: {
          lt: 0,
        },
      },
    });

    if (remainingNegative === 0) {
      console.log("🎉 Todas as transações foram corrigidas com sucesso!");
    } else {
      console.log(
        `⚠️  Ainda restam ${remainingNegative} transações com valores negativos`
      );
    }
  } catch (error) {
    console.error("💥 Erro fatal durante a correção:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar script automaticamente
fixNegativeAmounts()
  .then(() => {
    console.log("🏁 Script de correção finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Falha no script de correção:", error);
    process.exit(1);
  });

export { fixNegativeAmounts };
