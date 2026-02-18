-- Add soft-delete support for core models

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX IF NOT EXISTS "Project_deletedAt_idx" ON "Project"("deletedAt");
CREATE INDEX IF NOT EXISTS "Workspace_deletedAt_idx" ON "Workspace"("deletedAt");
