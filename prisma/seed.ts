import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const remuneracaoEnvelope = await prisma.envelope.findFirst({
    where: {
      name: 'Remuneração',
      isGlobal: true,
    },
  })

  if (!remuneracaoEnvelope) {
    await prisma.envelope.create({
      data: {
        name: 'Remuneração',
        value: 0,
        type: 'MONETARY',
        isDeletable: false,
        isGlobal: true,
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
