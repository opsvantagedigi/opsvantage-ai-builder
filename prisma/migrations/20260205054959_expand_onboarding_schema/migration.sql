/*
  Warnings:

  - You are about to drop the column `goal` on the `Onboarding` table. All the data in the column will be lost.
  - You are about to drop the column `payload` on the `Onboarding` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('DRAFT', 'COMPLETED');

-- AlterTable
ALTER TABLE "Onboarding" DROP COLUMN "goal",
DROP COLUMN "payload",
ADD COLUMN     "brandVoice" TEXT,
ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "colorPalette" JSONB,
ADD COLUMN     "competitors" JSONB,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "designStyle" TEXT,
ADD COLUMN     "goals" TEXT,
ADD COLUMN     "status" "OnboardingStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "targetAudience" TEXT;
