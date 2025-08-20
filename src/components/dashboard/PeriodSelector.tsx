"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PeriodSelectorProps {
  value:
    | "7-days"
    | "this-month"
    | "last-month"
    | "3-months"
    | "6-months"
    | "12-months"
    | "all-time";
  onValueChange: (
    value:
      | "7-days"
      | "this-month"
      | "last-month"
      | "3-months"
      | "6-months"
      | "12-months"
      | "all-time"
  ) => void;
  className?: string;
}

export const PeriodSelector = ({
  value,
  onValueChange,
  className,
}: PeriodSelectorProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Selecionar período" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7-days">Últimos 7 dias</SelectItem>
        <SelectItem value="this-month">Este mês</SelectItem>
        <SelectItem value="last-month">Mês passado</SelectItem>
        <SelectItem value="3-months">Últimos 3 meses</SelectItem>
        <SelectItem value="6-months">Últimos 6 meses</SelectItem>
        <SelectItem value="12-months">Últimos 12 meses</SelectItem>
        <SelectItem value="all-time">Todo o período</SelectItem>
      </SelectContent>
    </Select>
  );
};
