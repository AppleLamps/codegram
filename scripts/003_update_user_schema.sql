-- Update the User table to make username optional
-- This allows NextAuth to create users initially without username
-- Username will be required during onboarding process

ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
