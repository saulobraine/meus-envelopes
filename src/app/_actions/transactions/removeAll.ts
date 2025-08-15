"use server";

import { getAuthenticatedUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function removeAllTransactions() {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) {
      throw new Error("Não autorizado");
    }

    // Deletar todas as transações do usuário
    const result = await prisma.transaction.deleteMany({
      where: {
        userId: user.id,
      },
    });

    return {
      success: true,
      deletedCount: result.count,
      message: `${result.count} transações foram excluídas com sucesso.`,
    };
  } catch (error) {
    console.error("Erro ao deletar todas as transações:", error);

    if (error instanceof Error) {
      throw new Error(`Erro ao deletar transações: ${error.message}`);
    }

    throw new Error("Erro interno do servidor");
  }
}
