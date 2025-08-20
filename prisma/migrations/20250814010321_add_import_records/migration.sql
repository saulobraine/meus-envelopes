-- CreateEnum
CREATE TYPE "ImportRecordStatus" AS ENUM ('PENDING', 'PROCESSING', 'IMPORTED', 'SKIPPED', 'ERROR');

-- AlterTable
ALTER TABLE "ImportJob" ADD COLUMN     "skippedRows" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ImportRecord" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "rawData" JSONB NOT NULL,
    "status" "ImportRecordStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "date" TIMESTAMP(3),
    "description" TEXT,
    "amount" INTEGER,
    "envelope" TEXT,
    "transactionId" TEXT,

    CONSTRAINT "ImportRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImportRecord_transactionId_key" ON "ImportRecord"("transactionId");

-- CreateIndex
CREATE INDEX "ImportRecord_jobId_idx" ON "ImportRecord"("jobId");

-- CreateIndex
CREATE INDEX "ImportRecord_status_idx" ON "ImportRecord"("status");

-- CreateIndex
CREATE INDEX "ImportRecord_rowNumber_idx" ON "ImportRecord"("rowNumber");
