import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const startTime = Date.now();

  try {
    // Verificar conexão com banco
    await prisma.$connect();

    // Verificar tabelas principais
    const [userCount, envelopeCount, transactionCount] = await Promise.all([
      prisma.user.count(),
      prisma.envelope.count(),
      prisma.transaction.count(),
    ]);

    // Verificar envelope global obrigatório
    const globalEnvelope = await prisma.envelope.findFirst({
      where: { isGlobal: true, name: "Remuneração" },
    });

    const duration = Date.now() - startTime;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      database: {
        connected: true,
        tables: {
          users: userCount,
          envelopes: envelopeCount,
          transactions: transactionCount,
        },
        globalEnvelope: globalEnvelope ? "Presente" : "Ausente",
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        database: {
          connected: false,
        },
        system: {
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        environment: process.env.NODE_ENV || "development",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
