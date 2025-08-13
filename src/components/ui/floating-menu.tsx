"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Minus } from "phosphor-react";
import { useState } from "react";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";

export function FloatingMenu() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "expense"
  );

  const handleIncomeTransaction = () => {
    setTransactionType("income");
    setIsDialogOpen(true);
  };

  const handleExpenseTransaction = () => {
    setTransactionType("expense");
    setIsDialogOpen(true);
  };

  const handleTransactionAdded = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <TooltipProvider>
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleIncomeTransaction}
                size="lg"
                className="purple-gradient hover:cursor-pointer h-12 w-12 rounded-full p-0"
              >
                <Plus size={20} weight="bold" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Adicionar entrada</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleExpenseTransaction}
                size="lg"
                variant="destructive"
                className="h-12 w-12 hover:cursor-pointer rounded-full p-0"
              >
                <Minus size={20} weight="bold" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Adicionar saída</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <TransactionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onTransactionAdded={handleTransactionAdded}
        defaultType={transactionType}
        mode="add"
      />
    </>
  );
}
