-- Add sequence number for founders claims

ALTER TABLE "FoundersClaim" ADD COLUMN IF NOT EXISTS "sequence" INTEGER;

-- Backfill sequence per offer based on creation order
WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "offerId" ORDER BY "createdAt", "id") AS seq
  FROM "FoundersClaim"
)
UPDATE "FoundersClaim" fc
SET "sequence" = ranked.seq
FROM ranked
WHERE fc."id" = ranked."id" AND fc."sequence" IS NULL;

-- Ensure each offer has a unique sequence value
CREATE UNIQUE INDEX IF NOT EXISTS "FoundersClaim_offerId_sequence_key" ON "FoundersClaim"("offerId", "sequence");
