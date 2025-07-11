/*
  Warnings:

  - You are about to alter the column `allocation` on the `BudgetEnvelope` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `amount` on the `CategoryBudget` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `percentage` on the `CategoryBudget` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `fixed` on the `MonthlyIncome` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `variable` on the `MonthlyIncome` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `amount` on the `Operation` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "BudgetEnvelope" ALTER COLUMN "allocation" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "CategoryBudget" ALTER COLUMN "amount" SET DATA TYPE INTEGER,
ALTER COLUMN "percentage" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "MonthlyIncome" ALTER COLUMN "fixed" SET DATA TYPE INTEGER,
ALTER COLUMN "variable" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Operation" ALTER COLUMN "amount" SET DATA TYPE INTEGER;
