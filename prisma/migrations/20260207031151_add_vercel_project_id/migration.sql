/*
  Warnings:

  - A unique constraint covering the columns `[openProviderHandle]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "vercelProjectId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "openProviderHandle" TEXT;

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priceAmount" DOUBLE PRECISION NOT NULL,
    "priceCurrency" TEXT NOT NULL,
    "nowPaymentsInvoiceId" TEXT,
    "openProviderOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_nowPaymentsInvoiceId_key" ON "Order"("nowPaymentsInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_openProviderOrderId_key" ON "Order"("openProviderOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "User_openProviderHandle_key" ON "User"("openProviderHandle");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
