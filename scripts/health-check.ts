#!/usr/bin/env ts-node

/**
 * Script de Verificação de Saúde do Banco de Dados
 *
 * Este script verifica:
 * 1. Conexão com o banco
 * 2. Integridade das tabelas
 * 3. Dados essenciais
 * 4. Performance básica
 */

import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

// Carregar variáveis de ambiente
config();

const prisma = new PrismaClient();

interface HealthStatus {
  status: "healthy" | "warning" | "unhealthy";
  checks: {
    connection: boolean;
    tables: boolean;
    data: boolean;
    performance: boolean;
  };
  details: {
    connection?: string;
    tables?: string[];
    data?: Record<string, any>;
    performance?: Record<string, number>;
  };
  timestamp: string;
  duration: number;
}

async function checkConnection(): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    await prisma.$connect();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: `Falha na conexão: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}

async function checkTables(): Promise<{ success: boolean; tables?: string[] }> {
  try {
    // Verificar se as tabelas principais existem e têm dados
    const tables = ["User", "Envelope", "Transaction", "ImportJob"];
    const results = await Promise.allSettled([
      prisma.user.count(),
      prisma.envelope.count(),
      prisma.transaction.count(),
      prisma.importJob.count(),
    ]);

    const tableStatus = results.map((result, index) => ({
      table: tables[index],
      status: result.status === "fulfilled" ? "ok" : "error",
      count: result.status === "fulfilled" ? result.value : "N/A",
    }));

    const hasErrors = tableStatus.some((t) => t.status === "error");

    return {
      success: !hasErrors,
      tables: tableStatus.map((t) => `${t.table}: ${t.count}`),
    };
  } catch (error) {
    return {
      success: false,
      tables: [
        `Erro ao verificar tabelas: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      ],
    };
  }
}

async function checkData(): Promise<{
  success: boolean;
  data?: Record<string, any>;
}> {
  try {
    // Verificar dados essenciais
    const checks = await Promise.allSettled([
      // Verificar envelope global
      prisma.envelope.findFirst({
        where: { isGlobal: true, name: "Remuneração" },
      }),

      // Verificar usuários
      prisma.user.findFirst(),

      // Verificar configurações básicas
      prisma.envelope.count({ where: { isGlobal: true } }),
    ]);

    const results = {
      globalEnvelope:
        checks[0].status === "fulfilled" && checks[0].value
          ? "Presente"
          : "Ausente",
      hasUsers:
        checks[1].status === "fulfilled" && checks[1].value ? "Sim" : "Não",
      globalEnvelopes:
        checks[2].status === "fulfilled" ? checks[2].value : "Erro",
    };

    const hasWarnings =
      results.globalEnvelope === "Ausente" || results.hasUsers === "Não";

    return {
      success: !hasWarnings,
      data: results,
    };
  } catch (error) {
    return {
      success: false,
      data: {
        error: `Erro ao verificar dados: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      },
    };
  }
}

async function checkPerformance(): Promise<{
  success: boolean;
  metrics?: Record<string, number>;
}> {
  try {
    const startTime = Date.now();

    // Teste de performance básico
    const queries = [
      { name: "count_users", query: () => prisma.user.count() },
      { name: "count_envelopes", query: () => prisma.envelope.count() },
      { name: "count_transactions", query: () => prisma.transaction.count() },
      {
        name: "find_global_envelope",
        query: () => prisma.envelope.findFirst({ where: { isGlobal: true } }),
      },
    ];

    const results: Record<string, number> = {};

    for (const { name, query } of queries) {
      const queryStart = Date.now();
      await query();
      results[name] = Date.now() - queryStart;
    }

    const totalTime = Date.now() - startTime;
    results.total_time = totalTime;

    // Considerar saudável se todas as queries executarem em menos de 1000ms
    const isHealthy = Object.values(results).every((time) => time < 1000);

    return {
      success: isHealthy,
      metrics: results,
    };
  } catch (error) {
    return {
      success: false,
      metrics: { error: -1 },
    };
  }
}

async function generateHealthReport(): Promise<HealthStatus> {
  const startTime = Date.now();

  console.log("🔍 Iniciando verificação de saúde do banco de dados...");

  // Executar todas as verificações
  const [connection, tables, data, performance] = await Promise.all([
    checkConnection(),
    checkTables(),
    checkData(),
    checkPerformance(),
  ]);

  const duration = Date.now() - startTime;

  // Determinar status geral
  let status: "healthy" | "warning" | "unhealthy" = "healthy";

  if (!connection.success) {
    status = "unhealthy";
  } else if (!tables.success || !data.success || !performance.success) {
    status = "warning";
  }

  const healthStatus: HealthStatus = {
    status,
    checks: {
      connection: connection.success,
      tables: tables.success,
      data: data.success,
      performance: performance.success,
    },
    details: {
      connection: connection.message,
      tables: tables.tables,
      data: data.data,
      performance: performance.metrics,
    },
    timestamp: new Date().toISOString(),
    duration,
  };

  return healthStatus;
}

function printHealthReport(report: HealthStatus): void {
  console.log("\n" + "=".repeat(60));
  console.log("🏥 RELATÓRIO DE SAÚDE DO BANCO DE DADOS");
  console.log("=".repeat(60));

  // Status geral
  const statusEmoji = {
    healthy: "✅",
    warning: "⚠️",
    unhealthy: "❌",
  };

  console.log(
    `Status Geral: ${statusEmoji[report.status]} ${report.status.toUpperCase()}`
  );
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Duração: ${report.duration}ms`);

  console.log("\n📊 Verificações:");
  console.log(`  Conexão: ${report.checks.connection ? "✅" : "❌"}`);
  console.log(`  Tabelas: ${report.checks.tables ? "✅" : "❌"}`);
  console.log(`  Dados: ${report.checks.data ? "✅" : "❌"}`);
  console.log(`  Performance: ${report.checks.performance ? "✅" : "❌"}`);

  // Detalhes
  if (report.details.connection) {
    console.log(`\n🔌 Conexão: ${report.details.connection}`);
  }

  if (report.details.tables) {
    console.log(`\n📋 Tabelas:`);
    report.details.tables.forEach((table) => console.log(`  - ${table}`));
  }

  if (report.details.data) {
    console.log(`\n📊 Dados:`);
    Object.entries(report.details.data).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  }

  if (report.details.performance) {
    console.log(`\n⚡ Performance:`);
    Object.entries(report.details.performance).forEach(([key, value]) => {
      if (key !== "error") {
        console.log(`  ${key}: ${value}ms`);
      }
    });
  }

  console.log("\n" + "=".repeat(60));

  // Recomendações
  if (report.status === "unhealthy") {
    console.log(
      "🚨 AÇÃO REQUERIDA: O banco de dados está com problemas críticos!"
    );
    console.log("   - Verifique a conexão com o banco");
    console.log("   - Verifique as credenciais");
    console.log("   - Verifique se o banco está rodando");
  } else if (report.status === "warning") {
    console.log("⚠️  ATENÇÃO: O banco de dados tem alguns problemas menores");
    console.log("   - Verifique os logs para mais detalhes");
    console.log("   - Considere executar manutenção");
  } else {
    console.log("✅ O banco de dados está funcionando perfeitamente!");
  }

  console.log("=".repeat(60));
}

async function main(): Promise<void> {
  try {
    const report = await generateHealthReport();
    printHealthReport(report);

    // Retornar código de saída apropriado
    if (report.status === "unhealthy") {
      process.exit(1);
    } else if (report.status === "warning") {
      process.exit(2);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("💥 Erro fatal na verificação de saúde:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Erro fatal:", error);
    process.exit(1);
  });
}

export { generateHealthReport, main as healthCheck };

