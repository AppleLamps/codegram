-- Add password field to users table for simple auth
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- Update existing users to have a default password (they'll need to reset)
-- UPDATE "User" SET "password" = '$2a$12$defaulthashedpassword' WHERE "password" IS NULL;
