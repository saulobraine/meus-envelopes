"use client";
import { ChangeEvent, forwardRef, InputHTMLAttributes } from "react";

import { formatCurrency, parseCurrency } from "@/lib/currency";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ onChange, ...props }, ref) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      const parsedValue = parseCurrency(value);
      e.target.value = formatCurrency(parsedValue);

      if (onChange) {
        onChange(e);
      }
    };

    return <Input {...props} onChange={handleChange} ref={ref} />;
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
