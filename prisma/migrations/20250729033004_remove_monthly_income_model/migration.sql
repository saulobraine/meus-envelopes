/*
  Warnings:

  - You are about to drop the `MonthlyIncome` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "MonthlyIncome";

-- CreateIndex
CREATE INDEX "Operation_importSessionId_idx" ON "Operation"("importSessionId");
