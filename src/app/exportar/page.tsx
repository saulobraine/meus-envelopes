
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { exportarTransacoes } from '../_actions/exportarTransacoes'

export default function ExportarPage() {
  const [de, setDe] = useState<string>('')
  const [ate, setAte] = useState<string>('')

  const handleExport = async () => {
    const csv = await exportarTransacoes({
      de: de ? new Date(de) : undefined,
      ate: ate ? new Date(ate) : undefined,
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transacoes.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Exportar Transações</h1>
      <div className="flex flex-col gap-4 max-w-md">
        <Input type="date" value={de} onChange={(e) => setDe(e.target.value)} />
        <Input type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
        <Button onClick={handleExport}>Exportar</Button>
      </div>
    </div>
  )
}
