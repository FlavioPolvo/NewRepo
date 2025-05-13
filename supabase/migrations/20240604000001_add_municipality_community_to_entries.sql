-- Add municipality and community columns to entries table if they don't exist
ALTER TABLE entries ADD COLUMN IF NOT EXISTS municipality text;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS community text;

-- No need to add to supabase_realtime as it's already a member
-- The error was: relation "entries" is already member of publication "supabase_realtime"
