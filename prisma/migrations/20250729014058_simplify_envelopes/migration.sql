/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Operation` table. All the data in the column will be lost.
  - You are about to drop the `BudgetEnvelope` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CategoryBudget` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `envelopeId` to the `Operation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BudgetType" AS ENUM ('PERCENTAGE', 'MONETARY');

-- AlterEnum
ALTER TYPE "PreviewStatus" ADD VALUE 'CONFIRMED';

-- AlterTable
ALTER TABLE "Operation" DROP COLUMN "categoryId",
ADD COLUMN     "envelopeId" TEXT NOT NULL;

-- DropTable
DROP TABLE "BudgetEnvelope";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "CategoryBudget";

-- CreateTable
CREATE TABLE "Envelope" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "type" "BudgetType" NOT NULL,
    "isDeletable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Envelope_pkey" PRIMARY KEY ("id")
);
