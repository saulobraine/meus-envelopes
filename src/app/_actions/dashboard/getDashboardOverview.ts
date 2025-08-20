"use server";

import { getAuthenticatedUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getDashboardOverview(
  period:
    | "7-days"
    | "this-month"
    | "last-month"
    | "3-months"
    | "6-months"
    | "12-months"
    | "all-time" = "this-month"
) {
  const dashboardService = new DashboardOverviewService();
  return dashboardService.getOverview(period);
}

class DashboardOverviewService {
  async getOverview(period: string) {
    const user = await this.getAuthenticatedUser();
    const calculators = this.createCalculators(user.id);

    const currentData = await this.getCurrentPeriodData(calculators, period);
    const previousData = await this.getPreviousPeriodData(calculators, period);
    const additionalData = await this.getAdditionalData(calculators, period);

    const percentageCalculator = new PercentageCalculator(
      currentData,
      previousData
    );

    const incomeChange = percentageCalculator.calculateIncomeChange();
    const expensesChange = percentageCalculator.calculateExpensesChange();
    const balanceChange = percentageCalculator.calculateBalanceChange();

    return {
      totalBalance: currentData.income + currentData.expenses, // Balance for current period (expenses are already negative)
      monthlyIncome: currentData.income,
      monthlyExpenses: Math.abs(currentData.expenses), // Display as positive value
      amountToReceive: additionalData.amountToReceive,
      generalBalance: await calculators.balanceCalculator.calculateTotal(), // Total accumulated balance from all transactions
      incomeChange: {
        value: incomeChange.value,
        isPositive: incomeChange.isPositive,
        stringValue: incomeChange.toString(),
      },
      expensesChange: {
        value: expensesChange.value,
        isPositive: expensesChange.isPositive,
        stringValue: expensesChange.toString(),
      },
      balanceChange: {
        value: balanceChange.value,
        isPositive: balanceChange.isPositive,
        stringValue: balanceChange.toString(),
      },
    };
  }

  private async getAuthenticatedUser() {
    const { user } = await getAuthenticatedUser();
    return user;
  }

  private createCalculators(userId: string) {
    return {
      incomeCalculator: new IncomeCalculator(userId),
      expenseCalculator: new ExpenseCalculator(userId),
      balanceCalculator: new BalanceCalculator(userId),
      receivableCalculator: new ReceivableCalculator(userId),
    };
  }

  private async getCurrentPeriodData(calculators: any, period: string) {
    const dateRange = this.createDateRange(period);

    return {
      income: await calculators.incomeCalculator.calculateForPeriod(dateRange),
      expenses:
        await calculators.expenseCalculator.calculateForPeriod(dateRange),
    };
  }

  private async getPreviousPeriodData(calculators: any, period: string) {
    const dateRange = this.createPreviousDateRange(period);

    return {
      income: await calculators.incomeCalculator.calculateForPeriod(dateRange),
      expenses:
        await calculators.expenseCalculator.calculateForPeriod(dateRange),
    };
  }

  private async getAdditionalData(calculators: any, period: string) {
    // For all-time, use total; otherwise use scheduled for current period
    if (period === "all-time") {
      return {
        amountToReceive: await calculators.balanceCalculator.calculateTotal(),
      };
    }

    return {
      amountToReceive:
        await calculators.receivableCalculator.calculateScheduled(),
    };
  }

  private createDateRange(period: string): CustomDateRange {
    const factory = new DateRangeFactory();
    return factory.createRange(period);
  }

  private createPreviousDateRange(period: string): CustomDateRange {
    const calculator = new PreviousPeriodCalculator();
    return calculator.calculatePreviousPeriod(period);
  }
}

interface CustomDateRange {
  getStartDate(): Date;
  getEndDate(): Date;
}

class DateRangeFactory {
  createRange(period: string): CustomDateRange {
    const now = new Date();
    const calculator = new DateCalculator(now);
    return calculator.calculateRange(period);
  }
}

class DateCalculator {
  constructor(private readonly now: Date) {}

  calculateRange(period: string): CustomDateRange {
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
  calculate(now: Date): CustomDateRange;
}

class CustomDateRangeImpl implements CustomDateRange {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}

  getStartDate(): Date {
    return this.startDate;
  }

  getEndDate(): Date {
    return this.endDate;
  }
}

class SevenDaysStrategy implements DateCalculationStrategy {
  calculate(now: Date): CustomDateRange {
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    return new CustomDateRangeImpl(startDate, endDate);
  }
}

class ThisMonthStrategy implements DateCalculationStrategy {
  calculate(now: Date): CustomDateRange {
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    return new CustomDateRangeImpl(startDate, endDate);
  }
}

class LastMonthStrategy implements DateCalculationStrategy {
  calculate(now: Date): CustomDateRange {
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    endDate.setHours(23, 59, 59, 999);

    return new CustomDateRangeImpl(startDate, endDate);
  }
}

class ThreeMonthsStrategy implements DateCalculationStrategy {
  calculate(now: Date): CustomDateRange {
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 2);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    return new CustomDateRangeImpl(startDate, endDate);
  }
}

class SixMonthsStrategy implements DateCalculationStrategy {
  calculate(now: Date): CustomDateRange {
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 5);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    return new CustomDateRangeImpl(startDate, endDate);
  }
}

class TwelveMonthsStrategy implements DateCalculationStrategy {
  calculate(now: Date): CustomDateRange {
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 11);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    return new CustomDateRangeImpl(startDate, endDate);
  }
}

class AllTimeStrategy implements DateCalculationStrategy {
  calculate(now: Date): CustomDateRange {
    const startDate = new Date(2020, 0, 1); // Start from 2020
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    return new CustomDateRangeImpl(startDate, endDate);
  }
}

class PreviousPeriodCalculator {
  calculatePreviousPeriod(period: string): CustomDateRange {
    const now = new Date();

    switch (period) {
      case "7-days":
        return this.calculatePrevious7Days(now);
      case "this-month":
        return this.calculatePreviousMonth(now);
      case "last-month":
        return this.calculateTwoMonthsAgo(now);
      case "3-months":
        return this.calculatePrevious3Months(now);
      case "6-months":
        return this.calculatePrevious6Months(now);
      case "12-months":
        return this.calculatePrevious12Months(now);
      case "all-time":
        return this.calculatePreviousAllTime(now);
      default:
        return this.calculatePreviousMonth(now);
    }
  }

  private calculatePrevious7Days(now: Date): CustomDateRange {
    const endDate = new Date(now);
    endDate.setDate(now.getDate() - 7);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    return new CustomDateRangeImpl(startDate, endDate);
  }

  private calculatePreviousMonth(now: Date): CustomDateRange {
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    endDate.setHours(23, 59, 59, 999);

    return new CustomDateRangeImpl(startDate, endDate);
  }

  private calculateTwoMonthsAgo(now: Date): CustomDateRange {
    const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now.getFullYear(), now.getMonth() - 1, 0);
    endDate.setHours(23, 59, 59, 999);

    return new CustomDateRangeImpl(startDate, endDate);
  }

  private calculatePrevious3Months(now: Date): CustomDateRange {
    const currentStart = new Date(now);
    currentStart.setMonth(now.getMonth() - 2);
    currentStart.setDate(1);

    const startDate = new Date(currentStart);
    startDate.setMonth(currentStart.getMonth() - 3);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(currentStart);
    endDate.setDate(endDate.getDate() - 1);
    endDate.setHours(23, 59, 59, 999);

    return new CustomDateRangeImpl(startDate, endDate);
  }

  private calculatePrevious6Months(now: Date): CustomDateRange {
    const currentStart = new Date(now);
    currentStart.setMonth(now.getMonth() - 5);
    currentStart.setDate(1);

    const startDate = new Date(currentStart);
    startDate.setMonth(currentStart.getMonth() - 6);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(currentStart);
    endDate.setDate(endDate.getDate() - 1);
    endDate.setHours(23, 59, 59, 999);

    return new CustomDateRangeImpl(startDate, endDate);
  }

  private calculatePrevious12Months(now: Date): CustomDateRange {
    const currentStart = new Date(now);
    currentStart.setMonth(now.getMonth() - 11);
    currentStart.setDate(1);

    const startDate = new Date(currentStart);
    startDate.setMonth(currentStart.getMonth() - 12);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(currentStart);
    endDate.setDate(endDate.getDate() - 1);
    endDate.setHours(23, 59, 59, 999);

    return new CustomDateRangeImpl(startDate, endDate);
  }

  private calculatePreviousAllTime(now: Date): CustomDateRange {
    const startDate = new Date(2019, 0, 1); // Year before all-time start
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(2019, 11, 31); // End of 2019
    endDate.setHours(23, 59, 59, 999);

    return new CustomDateRangeImpl(startDate, endDate);
  }
}

class IncomeCalculator {
  constructor(private readonly userId: string) {}

  async calculateForPeriod(dateRange: CustomDateRange): Promise<number> {
    const result = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId: this.userId,
        type: "INCOME",
        date: {
          gte: dateRange.getStartDate().toISOString(),
          lte: dateRange.getEndDate().toISOString(),
        },
      },
    });

    return result._sum.amount || 0;
  }

  async calculateTotal(): Promise<number> {
    const result = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId: this.userId,
        type: "INCOME",
      },
    });

    return result._sum.amount || 0;
  }
}

class ExpenseCalculator {
  constructor(private readonly userId: string) {}

  async calculateForPeriod(dateRange: CustomDateRange): Promise<number> {
    const result = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId: this.userId,
        type: "EXPENSE",
        date: {
          gte: dateRange.getStartDate().toISOString(),
          lte: dateRange.getEndDate().toISOString(),
        },
      },
    });

    // Convert to negative since expenses should be negative for calculations
    return -(result._sum.amount || 0);
  }

  async calculateTotal(): Promise<number> {
    const result = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId: this.userId,
        type: "EXPENSE",
      },
    });

    // Convert to negative since expenses should be negative for calculations
    return -(result._sum.amount || 0);
  }
}

class BalanceCalculator {
  constructor(private readonly userId: string) {}

  async calculateTotal(): Promise<number> {
    const incomeCalculator = new IncomeCalculator(this.userId);
    const expenseCalculator = new ExpenseCalculator(this.userId);

    const totalIncome = await incomeCalculator.calculateTotal();
    const totalExpenses = await expenseCalculator.calculateTotal();

    return totalIncome + totalExpenses; // expenses are already negative values
  }
}

class ReceivableCalculator {
  constructor(private readonly userId: string) {}

  async calculateScheduled(): Promise<number> {
    const result = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId: this.userId,
        type: "INCOME",
        status: "SCHEDULED",
        scheduledAt: {
          lte: new Date().toISOString(),
        },
      },
    });

    return result._sum.amount || 0;
  }
}

class PercentageCalculator {
  constructor(
    private readonly currentData: { income: number; expenses: number },
    private readonly previousData: { income: number; expenses: number }
  ) {}

  calculateIncomeChange(): PercentageChange {
    return this.calculatePercentage(
      this.currentData.income,
      this.previousData.income
    );
  }

  calculateExpensesChange(): PercentageChange {
    return this.calculatePercentage(
      Math.abs(this.currentData.expenses),
      Math.abs(this.previousData.expenses)
    );
  }

  calculateBalanceChange(): PercentageChange {
    const currentBalance = this.currentData.income + this.currentData.expenses; // expenses are already negative
    const previousBalance =
      this.previousData.income + this.previousData.expenses; // expenses are already negative

    return this.calculatePercentage(currentBalance, previousBalance);
  }

  private calculatePercentage(
    current: number,
    previous: number
  ): PercentageChange {
    if (previous === 0) {
      return new PercentageChange(0, current > 0);
    }

    const percentage = ((current - previous) / Math.abs(previous)) * 100;
    return new PercentageChange(Math.abs(percentage), percentage > 0);
  }
}

class PercentageChange {
  constructor(
    public readonly value: number,
    public readonly isPositive: boolean
  ) {}

  toString(): string {
    const sign = this.isPositive ? "+" : "-";
    return `${sign}${this.value.toFixed(1)}%`;
  }
}
