/*
  Warnings:

  - A unique constraint covering the columns `[stripe_customer_id]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripe_subscription_id]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "stripe_current_period_end" TIMESTAMP(3),
ADD COLUMN     "stripe_customer_id" TEXT,
ADD COLUMN     "stripe_price_id" TEXT,
ADD COLUMN     "stripe_subscription_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_stripe_customer_id_key" ON "Workspace"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_stripe_subscription_id_key" ON "Workspace"("stripe_subscription_id");
