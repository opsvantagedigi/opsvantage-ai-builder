-- Viral waitlist: referrals + wheel prize + sovereign founder flag

ALTER TABLE "LaunchLead" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE "LaunchLead" ADD COLUMN IF NOT EXISTS "referredById" TEXT;
ALTER TABLE "LaunchLead" ADD COLUMN IF NOT EXISTS "referralsCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "LaunchLead" ADD COLUMN IF NOT EXISTS "wheelPrize" TEXT;
ALTER TABLE "LaunchLead" ADD COLUMN IF NOT EXISTS "wheelPrizeAt" TIMESTAMP(3);
ALTER TABLE "LaunchLead" ADD COLUMN IF NOT EXISTS "sovereignFounder" BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill referralCode for existing rows
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT "id" FROM "LaunchLead" WHERE "referralCode" IS NULL LOOP
    -- Stable-ish short code from id; keep it URL-safe
    UPDATE "LaunchLead"
      SET "referralCode" = substring(replace(r."id", '-', ''), 1, 10)
      WHERE "id" = r."id";
  END LOOP;
END $$;

-- Enforce referralCode required/unique
ALTER TABLE "LaunchLead" ALTER COLUMN "referralCode" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "LaunchLead_referralCode_key" ON "LaunchLead"("referralCode");
CREATE INDEX IF NOT EXISTS "LaunchLead_createdAt_idx" ON "LaunchLead"("createdAt");
CREATE INDEX IF NOT EXISTS "LaunchLead_referredById_idx" ON "LaunchLead"("referredById");

-- Self-referential FK for referrals (optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'LaunchLead_referredById_fkey'
  ) THEN
    ALTER TABLE "LaunchLead"
      ADD CONSTRAINT "LaunchLead_referredById_fkey"
      FOREIGN KEY ("referredById") REFERENCES "LaunchLead"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
