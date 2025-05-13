-- Add analysis_date and invoice_number columns to entries table
ALTER TABLE entries
ADD COLUMN IF NOT EXISTS analysis_date DATE,
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR;

-- Make sure the table is part of the realtime publication
-- (This is a no-op if it's already part of the publication)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'entries'
  ) THEN
    ALTER publication supabase_realtime ADD TABLE entries;
  END IF;
END
$$;
