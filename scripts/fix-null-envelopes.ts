import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Verificando operações sem envelope...");

  // Busca transações sem envelope
  const transactionsWithoutEnvelope = await prisma.transaction.findMany({
    where: {
      envelopeId: "",
    },
    include: {
      user: true,
    },
  });

  console.log(
    `📊 Encontradas ${transactionsWithoutEnvelope.length} transações sem envelope`
  );

  if (transactionsWithoutEnvelope.length === 0) {
    console.log("✅ Todas as transações já possuem envelope");
    return;
  }

  // Busca o envelope padrão "Remuneração"
  const defaultEnvelope = await prisma.envelope.findFirst({
    where: {
      name: "Remuneração",
      isGlobal: true,
    },
  });

  if (!defaultEnvelope) {
    console.log('❌ Envelope padrão "Remuneração" não encontrado');
    return;
  }

  console.log(
    `🔄 Associando operações ao envelope "${defaultEnvelope.name}"...`
  );

  // Atualiza todas as transações sem envelope
  const result = await prisma.transaction.updateMany({
    where: {
      envelopeId: "",
    },
    data: {
      envelopeId: defaultEnvelope.id,
    },
  });

  console.log(`✅ ${result.count} operações foram atualizadas`);

  // Verifica se ainda existem transações sem envelope
  const remainingTransactions = await prisma.transaction.count({
    where: {
      envelopeId: "",
    },
  });

  if (remainingTransactions === 0) {
    console.log("🎯 Todas as transações agora possuem envelope!");
  } else {
    console.log(
      `⚠️ Ainda existem ${remainingTransactions} transações sem envelope`
    );
  }
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
