"use client";
import {
  ChangeEvent,
  forwardRef,
  InputHTMLAttributes,
  useState,
  useEffect,
} from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  value?: string | number;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ onChange, value, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");

    // Função para formatar o valor como moeda brasileira
    const formatCurrency = (value: string): string => {
      // Remove todos os caracteres exceto números
      const numbers = value.replace(/\D/g, "");

      if (!numbers) return "";

      // Converte para número e divide por 100 para ter centavos
      const number = parseInt(numbers, 10) / 100;

      // Formata como moeda brasileira
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number);
    };

    // Função para limpar a formatação e retornar apenas números
    const parseCurrency = (value: string): string => {
      return value.replace(/\D/g, "");
    };

    // Atualiza o valor de exibição quando o value prop muda
    useEffect(() => {
      if (value !== undefined) {
        if (typeof value === "number") {
          // Se for número, formata diretamente
          const formatted = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(value / 100);
          setDisplayValue(formatted);
        } else if (typeof value === "string") {
          // Se for string, verifica se já está formatada
          if (value.includes("R$") || value.includes(",")) {
            setDisplayValue(value);
          } else {
            // Se não está formatada, formata
            const formatted = formatCurrency(value);
            setDisplayValue(formatted);
          }
        }
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Se o campo está vazio, limpa o valor
      if (!inputValue) {
        setDisplayValue("");
        if (onChange) {
          // Cria um evento com valor vazio
          const emptyEvent = {
            ...e,
            target: { ...e.target, value: "" },
          } as ChangeEvent<HTMLInputElement>;
          onChange(emptyEvent);
        }
        return;
      }

      // Remove formatação existente e aplica nova formatação
      const cleanValue = parseCurrency(inputValue);
      const formattedValue = formatCurrency(cleanValue);

      setDisplayValue(formattedValue);

      if (onChange) {
        // Cria um evento com o valor formatado
        const formattedEvent = {
          ...e,
          target: { ...e.target, value: formattedValue },
        } as ChangeEvent<HTMLInputElement>;
        onChange(formattedEvent);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Garante que o valor está formatado corretamente ao sair do campo
      const inputValue = e.target.value;
      if (inputValue && !inputValue.includes("R$")) {
        const formattedValue = formatCurrency(inputValue);
        setDisplayValue(formattedValue);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        type="text"
        inputMode="decimal"
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
