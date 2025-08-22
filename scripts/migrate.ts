#!/usr/bin/env ts-node

/**
 * Script de Migração Automática para Deploy
 *
 * Este script:
 * 1. Executa as migrações pendentes do Prisma
 * 2. Gera o cliente Prisma
 * 3. Executa o seed do banco de dados
 * 4. Verifica a integridade do banco
 */

import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

// Carregar variáveis de ambiente
config();

const prisma = new PrismaClient();

async function runCommand(command: string, description: string): Promise<void> {
  try {
    console.log(`🔄 ${description}...`);
    execSync(command, { stdio: "inherit" });
    console.log(`✅ ${description} concluído com sucesso`);
  } catch (error) {
    console.error(`❌ Erro ao executar: ${description}`);
    console.error(error);
    throw error;
  }
}

async function checkDatabaseHealth(): Promise<void> {
  try {
    console.log("🔍 Verificando saúde do banco de dados...");

    // Testar conexão
    await prisma.$connect();
    console.log("✅ Conexão com banco estabelecida");

    // Verificar se as tabelas principais existem
    const userCount = await prisma.user.count();
    const envelopeCount = await prisma.envelope.count();
    const transactionCount = await prisma.transaction.count();

    console.log(`📊 Estatísticas do banco:`);
    console.log(`   - Usuários: ${userCount}`);
    console.log(`   - Envelopes: ${envelopeCount}`);
    console.log(`   - Transações: ${transactionCount}`);

    // Verificar envelope global obrigatório
    const globalEnvelope = await prisma.envelope.findFirst({
      where: { isGlobal: true, name: "Remuneração" },
    });

    if (!globalEnvelope) {
      console.log(
        '⚠️  Envelope global "Remuneração" não encontrado, executando seed...'
      );
      await runSeed();
    } else {
      console.log('✅ Envelope global "Remuneração" encontrado');
    }

    console.log("✅ Verificação de saúde concluída");
  } catch (error) {
    console.error("❌ Erro na verificação de saúde do banco:", error);
    throw error;
  }
}

async function runSeed(): Promise<void> {
  try {
    console.log("🌱 Executando seed do banco de dados...");

    // Verificar se o envelope global existe
    const remuneracaoEnvelope = await prisma.envelope.findFirst({
      where: {
        name: "Remuneração",
        isGlobal: true,
      },
    });

    if (!remuneracaoEnvelope) {
      await prisma.envelope.create({
        data: {
          name: "Remuneração",
          value: 0,
          type: "MONETARY",
          isDeletable: false,
          isGlobal: true,
        },
      });
      console.log('✅ Envelope global "Remuneração" criado');
    } else {
      console.log('✅ Envelope global "Remuneração" já existe');
    }

    console.log("✅ Seed concluído com sucesso");
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    throw error;
  }
}

async function main(): Promise<void> {
  const startTime = Date.now();

  try {
    console.log("🚀 Iniciando processo de migração automática...");
    console.log(`📅 ${new Date().toISOString()}`);
    console.log("=".repeat(50));

    // 1. Gerar cliente Prisma
    await runCommand("npx prisma generate", "Gerando cliente Prisma");

    // 2. Executar migrações pendentes
    await runCommand(
      "npx prisma migrate deploy",
      "Executando migrações pendentes"
    );

    // 3. Verificar saúde do banco e executar seed se necessário
    await checkDatabaseHealth();

    const duration = Date.now() - startTime;
    console.log("=".repeat(50));
    console.log(
      `🎉 Migração automática concluída com sucesso em ${duration}ms`
    );
    console.log(`📅 ${new Date().toISOString()}`);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("=".repeat(50));
    console.error(`💥 Falha na migração automática após ${duration}ms`);
    console.error(`📅 ${new Date().toISOString()}`);
    console.error("Erro:", error);
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

export { main as migrate };
