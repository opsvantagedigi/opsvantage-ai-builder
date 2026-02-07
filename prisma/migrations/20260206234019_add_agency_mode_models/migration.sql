-- CreateEnum
CREATE TYPE "WorkspaceType" AS ENUM ('STANDARD', 'AGENCY');

-- CreateEnum
CREATE TYPE "AgencyClientStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "type" "WorkspaceType" NOT NULL DEFAULT 'STANDARD';

-- CreateTable
CREATE TABLE "AgencyClient" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "AgencyClientStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyClient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgencyClient_agencyId_clientId_key" ON "AgencyClient"("agencyId", "clientId");

-- AddForeignKey
ALTER TABLE "AgencyClient" ADD CONSTRAINT "AgencyClient_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyClient" ADD CONSTRAINT "AgencyClient_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
