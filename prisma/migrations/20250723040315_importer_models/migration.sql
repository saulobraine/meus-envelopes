/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Operation` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Operation` table. All the data in the column will be lost.
  - Made the column `description` on table `Operation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `categoryId` on table `Operation` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('COMPLETED', 'PENDING', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "PreviewStatus" AS ENUM ('NEW', 'DUPLICATE', 'ERROR');

-- AlterTable
ALTER TABLE "Operation" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "importSessionId" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "date" DROP DEFAULT,
ALTER COLUMN "categoryId" SET NOT NULL;

-- CreateTable
CREATE TABLE "ImportSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileName" TEXT NOT NULL,
    "importedCount" INTEGER NOT NULL DEFAULT 0,
    "ignoredCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,

    CONSTRAINT "ImportSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportTransactionPreview" (
    "id" TEXT NOT NULL,
    "importSessionId" TEXT NOT NULL,
    "status" "PreviewStatus" NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB NOT NULL,

    CONSTRAINT "ImportTransactionPreview_pkey" PRIMARY KEY ("id")
);
