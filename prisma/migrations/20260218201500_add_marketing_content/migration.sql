-- Create MarketingContent table for dynamic hero rotation

CREATE TABLE "MarketingContent" (
    "id" TEXT NOT NULL,
    "phase" TEXT,
    "headline" TEXT NOT NULL,
    "subheader" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL,
    "ctaHref" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingContent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MarketingContent_isActive_sortOrder_idx" ON "MarketingContent"("isActive", "sortOrder");
