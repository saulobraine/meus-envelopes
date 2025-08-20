"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { House, ArrowClockwise } from "phosphor-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-2xl px-8">
        {/* Imagem cômica do gato */}
        <div className="mb-8">
          <div className="mx-auto rounded-lg w-64 h-48 bg-muted flex items-center justify-center">
            <span className="text-6xl">🐱</span>
          </div>
        </div>

        {/* Texto principal */}
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Ops! Esta página saiu para comprar ração
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Parece que você encontrou um cantinho da internet que não existe... ou
          talvez esteja escondido como este gatinho! 🐱
        </p>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default" size="lg">
            <Link href="/">
              <House className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.reload()}
          >
            <ArrowClockwise className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    </div>
  );
}
