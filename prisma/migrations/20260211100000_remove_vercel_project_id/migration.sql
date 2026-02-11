-- DropIndex
DROP INDEX IF EXISTS "Project_vercelProjectId_key";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "vercelProjectId";