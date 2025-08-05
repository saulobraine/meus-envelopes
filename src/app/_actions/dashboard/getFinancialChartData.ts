import { getAuthenticatedUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getFinancialChartData(
  period: "this-month" | "last-month" | "6-months" | "12-months" | "all-time"
) {
  const { userId } = await getAuthenticatedUser();

  let startDate: Date;
  let endDate: Date;
  const now = new Date();

  switch (period) {
    case "this-month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case "last-month":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case "6-months":
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case "12-months":
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case "all-time":
      startDate = new Date(0); // Epoch time
      endDate = now;
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: userId,
      date: {
        gte: startDate.toISOString(),
        lte: endDate.toISOString(),
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Aggregate data by week for monthly views, by month for 6/12 months, by year for all-time
  const aggregatedData: { name: string; entradas: number; saidas: number }[] =
    [];

  if (period === "this-month" || period === "last-month") {
    // Aggregate by week
    const weeks = new Map<string, { entradas: number; saidas: number }>();
    transactions.forEach((tx) => {
      const weekNumber = Math.ceil(tx.date.getDate() / 7);
      const weekKey = `Sem ${weekNumber}`;
      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, { entradas: 0, saidas: 0 });
      }
      const current = weeks.get(weekKey)!;
      if (tx.type === "INCOME") {
        current.entradas += Number(tx.amount);
      } else {
        current.saidas += Number(tx.amount);
      }
    });
    for (let i = 1; i <= 4; i++) {
      const weekKey = `Sem ${i}`;
      aggregatedData.push({
        name: weekKey,
        entradas: weeks.get(weekKey)?.entradas || 0,
        saidas: weeks.get(weekKey)?.saidas || 0,
      });
    }
  } else if (period === "6-months" || period === "12-months") {
    // Aggregate by month
    const months = new Map<string, { entradas: number; saidas: number }>();
    transactions.forEach((tx) => {
      const monthKey = tx.date.toLocaleString("pt-BR", { month: "short" });
      if (!months.has(monthKey)) {
        months.set(monthKey, { entradas: 0, saidas: 0 });
      }
      const current = months.get(monthKey)!;
      if (tx.type === "INCOME") {
        current.entradas += Number(tx.amount);
      } else {
        current.saidas += Number(tx.amount);
      }
    });
    // Ensure all months in the range are present
    let currentMonth = new Date(startDate);
    while (currentMonth <= endDate) {
      const monthKey = currentMonth.toLocaleString("pt-BR", { month: "short" });
      aggregatedData.push({
        name: monthKey,
        entradas: months.get(monthKey)?.entradas || 0,
        saidas: months.get(monthKey)?.saidas || 0,
      });
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
  } else if (period === "all-time") {
    // Aggregate by year
    const years = new Map<string, { entradas: number; saidas: number }>();
    transactions.forEach((tx) => {
      const yearKey = tx.date.getFullYear().toString();
      if (!years.has(yearKey)) {
        years.set(yearKey, { entradas: 0, saidas: 0 });
      }
      const current = years.get(yearKey)!;
      if (tx.type === "INCOME") {
        current.entradas += Number(tx.amount);
      } else {
        current.saidas += Number(tx.amount);
      }
    });
  }

  return aggregatedData;
}