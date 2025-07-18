'use client'

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

import { User } from "@supabase/supabase-js";

// This component will receive user and signOut function as props
export default function MainNav({ user, signOut }: { user: User | null; signOut: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-card text-card-foreground shadow-sm py-4 sticky top-0 z-10">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold" onClick={() => setIsOpen(false)}>
          Meus Envelopes
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Painel</Link>
              <Link href="/planning" className="text-muted-foreground hover:text-foreground">Planejamento</Link>
              <Link href="/shared-accounts" className="text-muted-foreground hover:text-foreground">Contas</Link>
              <Link href="/settings" className="text-muted-foreground hover:text-foreground">Configurações</Link>
              <form action={signOut}>
                <button type="submit" className="text-destructive hover:text-destructive/90">Sair</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="text-muted-foreground hover:text-foreground">Entrar</Link>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <ThemeToggle />
          <Button onClick={() => setIsOpen(!isOpen)} variant="ghost" size="icon">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-card shadow-md">
          <div className="container mx-auto flex flex-col items-center space-y-4 py-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>Painel</Link>
                <Link href="/planning" className="text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>Planejamento</Link>
                <Link href="/shared-accounts" className="text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>Contas</Link>
                <Link href="/settings" className="text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>Configurações</Link>
                <form action={signOut}>
                  <button type="submit" className="text-destructive hover:text-destructive/90">Sair</button>
                </form>
              </>
            ) : (
              <Link href="/login" className="text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>Entrar</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
