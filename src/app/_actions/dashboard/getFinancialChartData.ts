"use server";

import { getAuthenticatedUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getFinancialChartData(
  period:
    | "7-days"
    | "this-month"
    | "last-month"
    | "3-months"
    | "6-months"
    | "12-months"
    | "all-time"
) {
  const chartDataService = new ChartDataService();
  return chartDataService.getChartData(period);
}

class ChartDataService {
  async getChartData(period: string) {
    const user = await this.getAuthenticatedUser();
    const dateRange = this.createDateRange(period);
    const transactions = await this.fetchTransactions(user.id, dateRange);
    const envelopes = await this.getEnvelopesWithTransactions(
      transactions,
      user.id
    );
    const aggregatedData = this.aggregateTransactionData(
      transactions,
      envelopes,
      period,
      dateRange
    );

    return {
      data: aggregatedData,
      envelopes: envelopes.map((envelope) => envelope.name),
    };
  }

  private async getAuthenticatedUser() {
    const { user } = await getAuthenticatedUser();
    return user;
  }

  private createDateRange(period: string) {
    const dateRangeFactory = new DateRangeFactory();
    return dateRangeFactory.createRange(period);
  }

  private async fetchTransactions(userId: string, dateRange: DateRange) {
    const transactionRepository = new TransactionRepository();
    return transactionRepository.findByUserAndDateRange(userId, dateRange);
  }

  private async getEnvelopesWithTransactions(
    transactions: any[],
    userId: string
  ) {
    const envelopeRepository = new EnvelopeRepository();
    return envelopeRepository.findByTransactions(transactions, userId);
  }

  private aggregateTransactionData(
    transactions: any[],
    envelopes: any[],
    period: string,
    dateRange: DateRange
  ) {
    const aggregator = new TransactionAggregator(
      transactions,
      envelopes,
      period,
      dateRange
    );
    return aggregator.aggregate();
  }
}

class DateRangeFactory {
  createRange(period: string): DateRange {
    const now = new Date();
    const calculator = new DateCalculator(now);

    return calculator.calculateRange(period);
  }
}

class DateCalculator {
  constructor(private readonly now: Date) {}

  calculateRange(period: string): DateRange {
    const strategy = this.createCalculationStrategy(period);
    return strategy.calculate(this.now);
  }

  private createCalculationStrategy(period: string): DateCalculationStrategy {
    const strategies: Record<string, DateCalculationStrategy> = {
      "7-days": new SevenDaysStrategy(),
      "this-month": new ThisMonthStrategy(),
      "last-month": new LastMonthStrategy(),
      "3-months": new ThreeMonthsStrategy(),
      "6-months": new SixMonthsStrategy(),
      "12-months": new TwelveMonthsStrategy(),
      "all-time": new AllTimeStrategy(),
    };

    return strategies[period] || new ThisMonthStrategy();
  }
}

interface DateCalculationStrategy {
  calculate(now: Date): DateRange;
}

class DateRange {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}
}

class SevenDaysStrategy implements DateCalculationStrategy {
  calculate(now: Date): DateRange {
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    return new DateRange(startDate, endDate);
  }
}

class ThisMonthStrategy implements DateCalculationStrategy {
  calculate(now: Date): DateRange {
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    return new DateRange(startDate, endDate);
  }
}

class LastMonthStrategy implements DateCalculationStrategy {
  calculate(now: Date): DateRange {
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    endDate.setHours(23, 59, 59, 999);

    return new DateRange(startDate, endDate);
  }
}

class ThreeMonthsStrategy implements DateCalculationStrategy {
  calculate(now: Date): DateRange {
    const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    return new DateRange(startDate, endDate);
  }
}

class SixMonthsStrategy implements DateCalculationStrategy {
  calculate(now: Date): DateRange {
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    return new DateRange(startDate, endDate);
  }
}

class TwelveMonthsStrategy implements DateCalculationStrategy {
  calculate(now: Date): DateRange {
    const startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    return new DateRange(startDate, endDate);
  }
}

class AllTimeStrategy implements DateCalculationStrategy {
  calculate(now: Date): DateRange {
    const startDate = new Date(0);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    return new DateRange(startDate, endDate);
  }
}

class TransactionRepository {
  async findByUserAndDateRange(userId: string, dateRange: DateRange) {
    return prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: dateRange.startDate.toISOString(),
          lte: dateRange.endDate.toISOString(),
        },
      },
      include: {
        envelope: true,
      },
      orderBy: {
        date: "asc",
      },
    });
  }
}

class EnvelopeRepository {
  async findByTransactions(transactions: any[], userId: string) {
    const envelopeNames = this.extractEnvelopeNames(transactions);

    return prisma.envelope.findMany({
      where: {
        name: {
          in: envelopeNames,
        },
        OR: [{ userId }, { isGlobal: true }],
      },
      orderBy: { name: "asc" },
    });
  }

  private extractEnvelopeNames(transactions: any[]): string[] {
    const envelopeNames = new Set<string>();
    transactions.forEach((transaction) => {
      envelopeNames.add(transaction.envelope.name);
    });
    return Array.from(envelopeNames);
  }
}

class TransactionAggregator {
  constructor(
    private readonly transactions: any[],
    private readonly envelopes: any[],
    private readonly period: string,
    private readonly dateRange: DateRange
  ) {}

  aggregate(): Record<string, any>[] {
    const strategy = this.createAggregationStrategy();
    return strategy.aggregate(
      this.transactions,
      this.envelopes,
      this.dateRange
    );
  }

  private createAggregationStrategy(): AggregationStrategy {
    const dailyPeriods = ["7-days", "this-month", "last-month"];
    const monthlyPeriods = ["3-months", "6-months", "12-months"];

    if (dailyPeriods.includes(this.period)) {
      return new DailyAggregationStrategy(this.period);
    }

    if (monthlyPeriods.includes(this.period)) {
      return new MonthlyAggregationStrategy();
    }

    return new YearlyAggregationStrategy();
  }
}

interface AggregationStrategy {
  aggregate(
    transactions: any[],
    envelopes: any[],
    dateRange: DateRange
  ): Record<string, any>[];
}

class DailyAggregationStrategy implements AggregationStrategy {
  constructor(private readonly period: string) {}

  aggregate(
    transactions: any[],
    envelopes: any[],
    dateRange: DateRange
  ): Record<string, any>[] {
    const dayMap = this.createDayMap(transactions);
    return this.generateDailyEntries(dayMap, envelopes, dateRange);
  }

  private createDayMap(
    transactions: any[]
  ): Map<string, Record<string, number>> {
    const dayMap = new Map<string, Record<string, number>>();

    transactions.forEach((transaction) => {
      const transactionProcessor = new TransactionProcessor(transaction);
      const dayKey = transactionProcessor.getDayKey();
      const envelopeName = transactionProcessor.getEnvelopeName();
      const amount = transactionProcessor.getAmount();

      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, {});
      }

      const dayData = dayMap.get(dayKey)!;
      dayData[envelopeName] = (dayData[envelopeName] || 0) + amount;
    });

    return dayMap;
  }

  private generateDailyEntries(
    dayMap: Map<string, Record<string, number>>,
    envelopes: any[],
    dateRange: DateRange
  ): Record<string, any>[] {
    const entries: Record<string, any>[] = [];
    const currentDay = new Date(dateRange.startDate);

    while (currentDay <= dateRange.endDate) {
      const dayKey = currentDay.getDate().toString().padStart(2, "0");
      const envelopeData = dayMap.get(dayKey);

      // Only include days that have transactions
      if (envelopeData && Object.keys(envelopeData).length > 0) {
        const dayEntry = this.createDayEntry(
          currentDay,
          envelopeData,
          envelopes
        );
        entries.push(dayEntry);
      }

      currentDay.setDate(currentDay.getDate() + 1);
    }

    return entries;
  }

  private createDayEntry(
    date: Date,
    envelopeData: Record<string, number>,
    envelopes: any[]
  ): Record<string, any> {
    const dayNameFormatter = new DayNameFormatter(this.period);
    const dayName = dayNameFormatter.format(date);

    const entry: Record<string, any> = { name: dayName };

    envelopes.forEach((envelope) => {
      entry[envelope.name] = envelopeData[envelope.name] || 0;
    });

    return entry;
  }
}

class MonthlyAggregationStrategy implements AggregationStrategy {
  aggregate(
    transactions: any[],
    envelopes: any[],
    dateRange: DateRange
  ): Record<string, any>[] {
    const monthMap = this.createMonthMap(transactions);
    return this.generateMonthlyEntries(monthMap, envelopes, dateRange);
  }

  private createMonthMap(
    transactions: any[]
  ): Map<string, Record<string, number>> {
    const monthMap = new Map<string, Record<string, number>>();

    transactions.forEach((transaction) => {
      const transactionProcessor = new TransactionProcessor(transaction);
      const monthKey = transactionProcessor.getMonthKey();
      const envelopeName = transactionProcessor.getEnvelopeName();
      const amount = transactionProcessor.getAmount();

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {});
      }

      const monthData = monthMap.get(monthKey)!;
      monthData[envelopeName] = (monthData[envelopeName] || 0) + amount;
    });

    return monthMap;
  }

  private generateMonthlyEntries(
    monthMap: Map<string, Record<string, number>>,
    envelopes: any[],
    dateRange: DateRange
  ): Record<string, any>[] {
    const entries: Record<string, any>[] = [];
    const currentMonth = new Date(dateRange.startDate);

    while (currentMonth <= dateRange.endDate) {
      const monthKey = currentMonth.toLocaleString("pt-BR", { month: "short" });
      const envelopeData = monthMap.get(monthKey);

      // Only include months that have transactions
      if (envelopeData && Object.keys(envelopeData).length > 0) {
        const monthEntry = this.createMonthEntry(
          monthKey,
          envelopeData,
          envelopes
        );
        entries.push(monthEntry);
      }

      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    return entries;
  }

  private createMonthEntry(
    monthKey: string,
    envelopeData: Record<string, number>,
    envelopes: any[]
  ): Record<string, any> {
    const entry: Record<string, any> = { name: monthKey };

    envelopes.forEach((envelope) => {
      entry[envelope.name] = envelopeData[envelope.name] || 0;
    });

    return entry;
  }
}

class YearlyAggregationStrategy implements AggregationStrategy {
  aggregate(transactions: any[], envelopes: any[]): Record<string, any>[] {
    const yearMap = this.createYearMap(transactions);
    return this.generateYearlyEntries(yearMap, envelopes);
  }

  private createYearMap(
    transactions: any[]
  ): Map<string, Record<string, number>> {
    const yearMap = new Map<string, Record<string, number>>();

    transactions.forEach((transaction) => {
      const transactionProcessor = new TransactionProcessor(transaction);
      const yearKey = transactionProcessor.getYearKey();
      const envelopeName = transactionProcessor.getEnvelopeName();
      const amount = transactionProcessor.getAmount();

      if (!yearMap.has(yearKey)) {
        yearMap.set(yearKey, {});
      }

      const yearData = yearMap.get(yearKey)!;
      yearData[envelopeName] = (yearData[envelopeName] || 0) + amount;
    });

    return yearMap;
  }

  private generateYearlyEntries(
    yearMap: Map<string, Record<string, number>>,
    envelopes: any[]
  ): Record<string, any>[] {
    const entries: Record<string, any>[] = [];

    Array.from(yearMap.entries())
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([year, envelopeData]) => {
        const yearEntry = this.createYearEntry(year, envelopeData, envelopes);
        entries.push(yearEntry);
      });

    return entries;
  }

  private createYearEntry(
    year: string,
    envelopeData: Record<string, number>,
    envelopes: any[]
  ): Record<string, any> {
    const entry: Record<string, any> = { name: year };

    envelopes.forEach((envelope) => {
      entry[envelope.name] = envelopeData[envelope.name] || 0;
    });

    return entry;
  }
}

class TransactionProcessor {
  constructor(private readonly transaction: any) {}

  getDayKey(): string {
    return this.transaction.date.getDate().toString().padStart(2, "0");
  }

  getMonthKey(): string {
    return this.transaction.date.toLocaleString("pt-BR", { month: "short" });
  }

  getYearKey(): string {
    return this.transaction.date.getFullYear().toString();
  }

  getEnvelopeName(): string {
    return this.transaction.envelope.name;
  }

  getAmount(): number {
    const amount = Number(this.transaction.amount) / 100; // Convert cents to reais
    return this.transaction.type === "INCOME" ? amount : -amount;
  }
}

class DayNameFormatter {
  constructor(private readonly period: string) {}

  format(date: Date): string {
    if (this.period === "7-days") {
      return this.formatForSevenDays(date);
    }

    return this.formatForMonth(date);
  }

  private formatForSevenDays(date: Date): string {
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
    });
  }

  private formatForMonth(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    return `Dia ${day}`;
  }
}
