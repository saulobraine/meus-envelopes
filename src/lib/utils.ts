import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Função para parsear datas no formato brasileiro (d/m/Y)
export function parseBrazilianDate(dateStr: string): Date {
  if (!dateStr || dateStr.trim() === "") {
    throw new Error("Data vazia");
  }

  const cleanDate = dateStr.trim();

  // Formatos suportados
  const patterns: {
    regex: RegExp;
    handler: (m: RegExpMatchArray) => Date | null;
  }[] = [
    // d/m/Y ou dd/mm/YYYY
    {
      regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      handler: ([, d, m, y]) => buildDate(+y, +m, +d),
    },
    // d-m-Y
    {
      regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
      handler: ([, d, m, y]) => buildDate(+y, +m, +d),
    },
    // d.m.Y
    {
      regex: /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
      handler: ([, d, m, y]) => buildDate(+y, +m, +d),
    },
    // Y-m-d (formato ISO curto)
    {
      regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      handler: ([, y, m, d]) => buildDate(+y, +m, +d),
    },
    // d/m/yy (2 dígitos de ano → assumir século 21)
    {
      regex: /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
      handler: ([, d, m, y]) => buildDate(2000 + +y, +m, +d),
    },
  ];

  for (const { regex, handler } of patterns) {
    const match = cleanDate.match(regex);
    if (match) {
      const date = handler(match);
      if (date) return date;
    }
  }

  // Fallback: tentar parser nativo
  const nativeDate = new Date(cleanDate);
  if (!isNaN(nativeDate.getTime())) {
    return nativeDate;
  }

  throw new Error(
    `Formato de data não reconhecido: "${dateStr}". Use d/m/Y, d-m-Y, d.m.Y, Y-m-d ou d/m/yy`
  );
}

// Helper para validar e criar Date
function buildDate(year: number, month: number, day: number): Date | null {
  if (
    year < 1900 ||
    year > 2100 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  // Validar overflow de mês/dia (ex: 31/02 → inválido)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

// Função para formatar valores monetários no gráfico (já em reais)
export function formatChartValue(value: number): string {
  const formatter = new ChartValueFormatter(value);
  return formatter.format();
}

// Função para formatar valores do YAxis (com abreviações para economia de espaço)
export function formatYAxisValue(value: number): string {
  const formatter = new YAxisValueFormatter(value);
  return formatter.format();
}

// Color utilities for consistent positive/negative value styling
export class ColorUtility {
  static getValueColorClass(value: number, isExpense = false): string {
    if (value === 0) return "text-muted-foreground opacity-50";

    // Para despesas, a lógica é inversa (mais gasto = ruim = vermelho)
    if (isExpense) {
      return value > 0
        ? "text-red-600 dark:text-red-400"
        : "text-green-600 dark:text-green-400";
    }

    // Para receitas e outros valores (mais = bom = verde)
    return value > 0
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  }

  static getTrendColorClass(isPositive: boolean, isExpense = false): string {
    // Para despesas, a lógica é inversa
    if (isExpense) {
      return isPositive ? "text-red-500" : "text-green-500";
    }

    // Para receitas e outros indicadores
    return isPositive ? "text-green-500" : "text-red-500";
  }

  static getBackgroundColorClass(value: number, isExpense = false): string {
    if (value === 0) return "bg-muted";

    if (isExpense) {
      return value > 0
        ? "bg-red-500 hover:bg-red-600"
        : "bg-green-500 hover:bg-green-600";
    }

    return value > 0
      ? "bg-green-500 hover:bg-green-600"
      : "bg-red-500 hover:bg-red-600";
  }
}

class ChartValueFormatter {
  private readonly value: number;

  constructor(value: number) {
    this.value = value;
  }

  format(): string {
    return this.formatAsFullValue();
  }

  private formatAsFullValue(): string {
    const formatter = this.createFullValueFormatter();
    return formatter.format(this.value);
  }

  private createFullValueFormatter(): Intl.NumberFormat {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}

class YAxisValueFormatter {
  private readonly value: number;
  private readonly MILLION_THRESHOLD = 1000000;
  private readonly THOUSAND_THRESHOLD = 1000;

  constructor(value: number) {
    this.value = value;
  }

  format(): string {
    if (this.isMillionValue()) {
      return this.formatAsMillions();
    }

    if (this.isThousandValue()) {
      return this.formatAsThousands();
    }

    return this.formatAsRegular();
  }

  private isMillionValue(): boolean {
    return this.value >= this.MILLION_THRESHOLD;
  }

  private isThousandValue(): boolean {
    return this.value >= this.THOUSAND_THRESHOLD;
  }

  private formatAsMillions(): string {
    const millionValue = this.value / this.MILLION_THRESHOLD;
    return `R$ ${millionValue.toFixed(1)}M`;
  }

  private formatAsThousands(): string {
    const thousandValue = this.value / this.THOUSAND_THRESHOLD;
    return `R$ ${thousandValue.toFixed(0)}K`;
  }

  private formatAsRegular(): string {
    const formatter = this.createRegularFormatter();
    return formatter.format(this.value);
  }

  private createRegularFormatter(): Intl.NumberFormat {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
}
