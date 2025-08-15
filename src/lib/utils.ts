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


