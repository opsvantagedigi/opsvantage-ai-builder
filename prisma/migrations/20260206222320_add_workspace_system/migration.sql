-- AlterTable
ALTER TABLE "Onboarding" ADD COLUMN     "backgroundTexturePrompts" JSONB,
ADD COLUMN     "fontPairing" JSONB,
ADD COLUMN     "heroImagePrompts" JSONB,
ADD COLUMN     "iconSet" JSONB,
ADD COLUMN     "layoutRecommendations" JSONB;

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT;

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
