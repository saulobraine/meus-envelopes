/*
  Warnings:

  - You are about to drop the column `importSessionId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `ImportSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ImportTransactionPreview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SharedAccountAccess` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Transaction_importSessionId_idx";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "importSessionId";

-- DropTable
DROP TABLE "ImportSession";

-- DropTable
DROP TABLE "ImportTransactionPreview";

-- DropTable
DROP TABLE "SharedAccountAccess";

-- DropEnum
DROP TYPE "PreviewStatus";
