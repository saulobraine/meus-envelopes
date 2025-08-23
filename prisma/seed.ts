import { BudgetType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 SCRIPT DE SEED INICIADO!");
  console.log("🌱 Iniciando seed do banco de dados...");
  console.log("🔍 Verificando variáveis de ambiente...");

  // Verificar DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL não encontrada!");
    process.exit(1);
  }
  console.log("✅ DATABASE_URL encontrada:", dbUrl.substring(0, 20) + "...");

  try {
    // Verificar conexão com banco
    console.log("🔌 Tentando conectar ao banco...");
    await prisma.$connect();
    console.log("✅ Conectado ao banco de dados");

    // Verificar se já existe envelope "Remuneração"
    const remuneracaoEnvelope = await prisma.envelope.findFirst({
      where: {
        name: "Remuneração",
        isGlobal: true,
      },
    });

    if (remuneracaoEnvelope) {
      console.log(
        "ℹ️ Envelope 'Remuneração' já existe, ID:",
        remuneracaoEnvelope.id
      );
    } else {
      console.log("🆕 Criando envelope 'Remuneração'...");

      const newEnvelope = await prisma.envelope.create({
        data: {
          name: "Remuneração",
          value: 0,
          type: BudgetType.MONETARY,
          isDeletable: false,
          isGlobal: true,
        },
      });

      console.log("✅ Envelope criado com sucesso, ID:", newEnvelope.id);
    }

    // Verificar total de envelopes
    const totalEnvelopes = await prisma.envelope.count();
    console.log("📊 Total de envelopes no banco:", totalEnvelopes);

    console.log("🎯 Seed concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante seed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
