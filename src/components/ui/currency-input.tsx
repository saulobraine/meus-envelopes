'use client'

import * as React from 'react'
import { formatCurrency, parseCurrency } from '@/lib/currency'
import { Input, InputProps } from '@/components/ui/input'

const CurrencyInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target
      const parsedValue = parseCurrency(value)
      e.target.value = formatCurrency(parsedValue)

      if (onChange) {
        onChange(e)
      }
    }

    return <Input {...props} onChange={handleChange} ref={ref} />
  },
)

CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput }
