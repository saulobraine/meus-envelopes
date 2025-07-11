'use client'

import { ThemeToggle } from '@/components/theme-toggle'

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Configurações</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Aparência</h2>
        <div className="flex items-center justify-between">
          <span>Tema (Claro/Escuro)</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
