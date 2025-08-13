"use server";

import { getAuthenticatedUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getDashboardOverview() {
  const { user } = await getAuthenticatedUser();

  // Fetch total income
  const totalIncome = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      userId: user.id,
      type: "INCOME",
    },
  });

  // Fetch total expenses
  const totalExpenses = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      userId: user.id,
      type: "EXPENSE",
    },
  });

  // Calculate total balance (income - expenses)
  const totalBalance =
    (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0);

  // Fetch total income for the current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(
    startOfMonth.getFullYear(),
    startOfMonth.getMonth() + 1,
    0
  );
  endOfMonth.setHours(23, 59, 59, 999);

  const monthlyIncome = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      userId: user.id,
      type: "INCOME",
      date: {
        gte: startOfMonth.toISOString(),
        lte: endOfMonth.toISOString(),
      },
    },
  });

  // Fetch total expenses for the current month
  const monthlyExpenses = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      userId: user.id,
      type: "EXPENSE",
      date: {
        gte: startOfMonth.toISOString(),
        lte: endOfMonth.toISOString(),
      },
    },
  });

  // Fetch total amount to receive (scheduled income not yet processed)
  const amountToReceive = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      userId: user.id,
      type: "INCOME",
      status: "SCHEDULED",
      scheduledAt: {
        lte: new Date().toISOString(), // Scheduled for today or in the past
      },
    },
  });

  return {
    totalBalance: totalBalance,
    monthlyIncome: monthlyIncome._sum.amount || 0,
    monthlyExpenses: monthlyExpenses._sum.amount || 0,
    amountToReceive: amountToReceive._sum.amount || 0,
  };
}
