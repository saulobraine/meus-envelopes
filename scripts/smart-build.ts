import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando build inteligente...");

  try {
    // 1. Verificar e corrigir problemas de envelope
    console.log("🔧 Verificando problemas de envelope...");
    await fixEnvelopeIssues();

    // 2. Executar migrações
    console.log("📊 Executando migrações...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });

    // 3. Gerar cliente Prisma
    console.log("⚙️ Gerando cliente Prisma...");
    execSync("npx prisma generate", { stdio: "inherit" });

    // 4. Executar seed
    console.log("🌱 Executando seed...");
    execSync("npx prisma db seed", { stdio: "inherit" });

    // 5. Build da aplicação
    console.log("🏗️ Fazendo build da aplicação...");
    execSync("npx next build", { stdio: "inherit" });

    console.log("✅ Build concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante o build:", error);
    process.exit(1);
  }
}

async function fixEnvelopeIssues() {
  try {
    // Verifica se existem transações sem envelope
    const transactionsWithoutEnvelope = await prisma.transaction.count({
      where: { envelopeId: "" },
    });

    if (transactionsWithoutEnvelope === 0) {
      console.log("✅ Nenhum problema de envelope encontrado");
      return;
    }

    console.log(
      `🔧 Encontradas ${transactionsWithoutEnvelope} transações sem envelope`
    );

    // Busca envelope padrão
    const defaultEnvelope = await prisma.envelope.findFirst({
      where: { name: "Remuneração", isGlobal: true },
    });

    if (!defaultEnvelope) {
      console.log("⚠️ Envelope padrão não encontrado, criando...");
      await prisma.envelope.create({
        data: {
          name: "Remuneração",
          value: 0,
          type: "MONETARY",
          isDeletable: false,
          isGlobal: true,
        },
      });
    }

    // Atualiza transações sem envelope
    const result = await prisma.transaction.updateMany({
      where: { envelopeId: "" },
      data: { envelopeId: defaultEnvelope?.id },
    });

    console.log(`✅ ${result.count} operações corrigidas`);
  } catch (error) {
    console.error("⚠️ Erro ao corrigir envelopes:", error);
    // Continua mesmo com erro
  }
}

main()
  .catch((e) => {
    console.error("❌ Erro fatal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
