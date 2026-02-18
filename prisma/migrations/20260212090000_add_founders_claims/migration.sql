-- Create FoundersClaim table (restored migration)

CREATE TABLE IF NOT EXISTS "FoundersClaim" (
  "id" TEXT NOT NULL,
  "offerId" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "userId" TEXT,
  "awardedOfferId" TEXT,
  "competitorPrice" DOUBLE PRECISION,
  "zenithPrice" DOUBLE PRECISION,
  "savedAmount" DOUBLE PRECISION,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FoundersClaim_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'FoundersClaim_offerId_fingerprint_key'
  ) THEN
    ALTER TABLE "FoundersClaim" ADD CONSTRAINT "FoundersClaim_offerId_fingerprint_key" UNIQUE ("offerId", "fingerprint");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'FoundersClaim_userId_fkey'
  ) THEN
    ALTER TABLE "FoundersClaim" ADD CONSTRAINT "FoundersClaim_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "FoundersClaim_offerId_createdAt_idx" ON "FoundersClaim"("offerId", "createdAt");
CREATE INDEX IF NOT EXISTS "FoundersClaim_userId_createdAt_idx" ON "FoundersClaim"("userId", "createdAt");
