#!/usr/bin/env ts-node

/**
 * Script de Rollback de Migrações
 *
 * Este script permite reverter migrações do Prisma em caso de problemas:
 * 1. Listar migrações disponíveis
 * 2. Reverter para uma migração específica
 * 3. Backup antes do rollback
 * 4. Verificação de integridade após rollback
 */

import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Carregar variáveis de ambiente
config();

const prisma = new PrismaClient();

interface Migration {
  id: string;
  name: string;
  timestamp: string;
  path: string;
}

interface RollbackOptions {
  targetMigration?: string;
  force: boolean;
  backup: boolean;
  dryRun: boolean;
}

function parseArgs(): RollbackOptions {
  const args = process.argv.slice(2);

  return {
    targetMigration: args.find((arg) => !arg.startsWith("--")),
    force: args.includes("--force"),
    backup: !args.includes("--no-backup"),
    dryRun: args.includes("--dry-run"),
  };
}

function runCommand(command: string, description: string): void {
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

function getMigrations(): Migration[] {
  try {
    const migrationsPath = join(process.cwd(), "prisma", "migrations");
    const migrations = readdirSync(migrationsPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => {
        const migrationPath = join(migrationsPath, dirent.name);
        const sqlPath = join(migrationPath, "migration.sql");

        let sqlContent = "";
        try {
          sqlContent = readFileSync(sqlPath, "utf-8");
        } catch (error) {
          sqlContent = "Arquivo SQL não encontrado";
        }

        return {
          id: dirent.name,
          name: dirent.name.replace(/^\d+_/, ""),
          timestamp: dirent.name.split("_")[0],
          path: migrationPath,
          sql: sqlContent,
        };
      })
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return migrations;
  } catch (error) {
    console.error("❌ Erro ao ler migrações:", error);
    return [];
  }
}

function printMigrations(migrations: Migration[]): void {
  console.log("\n📋 Migrações disponíveis:");
  console.log("=".repeat(80));

  migrations.forEach((migration, index) => {
    const status = index === migrations.length - 1 ? "🟢 ATUAL" : "⚪";
    console.log(`${status} ${migration.id} - ${migration.name}`);
    console.log(`   Timestamp: ${migration.timestamp}`);
    console.log(`   Caminho: ${migration.path}`);
    console.log("");
  });

  console.log("=".repeat(80));
}

async function createBackup(): Promise<string> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada");
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `backup-${timestamp}.sql`;

  console.log("💾 Criando backup do banco de dados...");

  try {
    // Para PostgreSQL, usar pg_dump
    if (process.env.DATABASE_URL.includes("postgresql")) {
      const url = new URL(process.env.DATABASE_URL);
      const host = url.hostname;
      const port = url.port || "5432";
      const database = url.pathname.slice(1);
      const username = url.username;
      const password = url.password;

      const pgDumpCommand = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f ${backupPath}`;

      execSync(pgDumpCommand, { stdio: "pipe" });
      console.log(`✅ Backup criado: ${backupPath}`);
    } else {
      console.log(
        "⚠️  Backup automático não suportado para este tipo de banco"
      );
      console.log("💡 Execute backup manual antes de continuar");
    }
  } catch (error) {
    console.warn("⚠️  Falha ao criar backup automático:", error);
    console.log("💡 Continue apenas se tiver backup manual");
  }

  return backupPath;
}

async function getCurrentMigration(): Promise<string> {
  try {
    // Verificar migração atual no banco
    const result = await prisma.$queryRaw`
      SELECT "migration_name" 
      FROM "_prisma_migrations" 
      ORDER BY "finished_at" DESC 
      LIMIT 1
    `;

    if (Array.isArray(result) && result.length > 0) {
      return result[0].migration_name;
    }

    return "unknown";
  } catch (error) {
    console.warn("⚠️  Não foi possível determinar migração atual:", error);
    return "unknown";
  }
}

async function performRollback(
  targetMigration: string,
  options: RollbackOptions
): Promise<void> {
  console.log(`🔄 Iniciando rollback para migração: ${targetMigration}`);

  if (options.dryRun) {
    console.log("🔍 MODO DRY RUN - Nenhuma alteração será feita");
    return;
  }

  if (options.backup) {
    await createBackup();
  }

  // Verificar se o rollback é seguro
  if (!options.force) {
    console.log("⚠️  ATENÇÃO: Rollback pode causar perda de dados!");
    console.log("💡 Use --force para confirmar");
    return;
  }

  try {
    // Reset do banco para o estado da migração alvo
    console.log("🔄 Resetando banco para migração alvo...");

    // Primeiro, resetar completamente
    runCommand("npx prisma migrate reset --force", "Reset completo do banco");

    // Depois, aplicar migrações até o alvo
    const migrations = getMigrations();
    const targetIndex = migrations.findIndex((m) => m.id === targetMigration);

    if (targetIndex === -1) {
      throw new Error(`Migração alvo não encontrada: ${targetMigration}`);
    }

    // Aplicar migrações até o alvo
    for (let i = 0; i <= targetIndex; i++) {
      const migration = migrations[i];
      console.log(`🔄 Aplicando migração: ${migration.id}`);

      // Executar SQL da migração
      const sqlPath = join(migration.path, "migration.sql");
      const sqlContent = readFileSync(sqlPath, "utf-8");

      // Dividir em comandos individuais
      const commands = sqlContent
        .split(";")
        .map((cmd) => cmd.trim())
        .filter((cmd) => cmd.length > 0);

      for (const command of commands) {
        if (command) {
          await prisma.$executeRawUnsafe(command);
        }
      }
    }

    console.log("✅ Rollback concluído com sucesso");

    // Verificar integridade
    await verifyIntegrity();
  } catch (error) {
    console.error("❌ Erro durante rollback:", error);
    throw error;
  }
}

async function verifyIntegrity(): Promise<void> {
  console.log("🔍 Verificando integridade após rollback...");

  try {
    // Verificar conexão
    await prisma.$connect();

    // Verificar tabelas principais
    const tables = ["User", "Envelope", "Transaction"];
    for (const table of tables) {
      try {
        await prisma.$queryRawUnsafe(`SELECT 1 FROM "${table}" LIMIT 1`);
        console.log(`✅ Tabela ${table}: OK`);
      } catch (error) {
        console.log(`❌ Tabela ${table}: ERRO`);
      }
    }

    console.log("✅ Verificação de integridade concluída");
  } catch (error) {
    console.error("❌ Erro na verificação de integridade:", error);
  }
}

function showHelp(): void {
  console.log(`
🔄 Script de Rollback de Migrações

Uso: npm run rollback [opções] [migração-alvo]

Opções:
  --force           Força o rollback sem confirmação
  --no-backup       Não cria backup antes do rollback
  --dry-run         Simula o rollback sem executar
  --help            Mostra esta ajuda

Exemplos:
  npm run rollback --help                    # Mostra ajuda
  npm run rollback                           # Lista migrações disponíveis
  npm run rollback 20241201000000_init      # Rollback para migração específica
  npm run rollback --force 20241201000000_init  # Força rollback
  npm run rollback --dry-run 20241201000000_init # Simula rollback

⚠️  ATENÇÃO: Rollback pode causar perda de dados!
💡 Sempre faça backup antes de executar rollback
🔒 Use --force apenas se tiver certeza absoluta
`);
}

async function main(): Promise<void> {
  const options = parseArgs();

  try {
    console.log("🔄 Script de Rollback de Migrações");
    console.log("=".repeat(60));

    // Mostrar ajuda se solicitado
    if (process.argv.includes("--help")) {
      showHelp();
      return;
    }

    // Listar migrações disponíveis
    const migrations = getMigrations();
    if (migrations.length === 0) {
      console.log("❌ Nenhuma migração encontrada");
      return;
    }

    printMigrations(migrations);

    // Se não especificou migração alvo, apenas listar
    if (!options.targetMigration) {
      console.log("💡 Para fazer rollback, especifique uma migração alvo");
      console.log("💡 Exemplo: npm run rollback 20241201000000_init");
      return;
    }

    // Verificar se a migração alvo existe
    const targetMigration = migrations.find(
      (m) => m.id === options.targetMigration
    );
    if (!targetMigration) {
      console.log(
        `❌ Migração alvo não encontrada: ${options.targetMigration}`
      );
      return;
    }

    // Mostrar informações da migração alvo
    console.log(
      `🎯 Migração alvo: ${targetMigration.id} - ${targetMigration.name}`
    );
    console.log(`📅 Timestamp: ${targetMigration.timestamp}`);

    // Verificar migração atual
    const currentMigration = await getCurrentMigration();
    console.log(`📍 Migração atual: ${currentMigration}`);

    // Executar rollback
    await performRollback(options.targetMigration, options);
  } catch (error) {
    console.error("💥 Erro fatal no rollback:", error);
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

export { main as rollback };
