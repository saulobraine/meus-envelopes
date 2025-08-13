import { prisma } from "@/lib/prisma";

export async function getOrCreateDefaultEnvelope() {
  const defaultEnvelopeName = "Remuneração";
  let envelope = await prisma.envelope.findFirst({
    where: {
      name: defaultEnvelopeName,
      isGlobal: true,
    },
  });

  if (!envelope) {
    envelope = await prisma.envelope.create({
      data: {
        name: defaultEnvelopeName,
        value: 0,
        type: "MONETARY",
        isDeletable: false,
        isGlobal: true,
      },
    });
  }

  return envelope.id;
}
