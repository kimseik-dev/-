-- Add currency column to Plan table
ALTER TABLE "Plan"
ADD COLUMN IF NOT EXISTS "currency" VARCHAR(3) NOT NULL DEFAULT 'KRW';
-- Update existing plans to KRW and convert prices
UPDATE "Plan"
SET "currency" = 'KRW',
    "monthly_price" = "monthly_price" * 1000
WHERE "currency" IS NULL
    OR "monthly_price" < 100;