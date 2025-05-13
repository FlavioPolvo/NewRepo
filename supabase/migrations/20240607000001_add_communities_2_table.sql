-- Create communities_2 table if it doesn't exist
CREATE TABLE IF NOT EXISTS communities_2 (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  municipality_id INTEGER REFERENCES municipalities(id)
);

-- Copy data from communities table if communities_2 is empty
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM communities_2) = 0 THEN
    INSERT INTO communities_2 (id, name, municipality_id)
    SELECT id, name, municipality_id FROM communities;
  END IF;
END
$$;

-- Make sure the table is part of the realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'communities_2'
  ) THEN
    ALTER publication supabase_realtime ADD TABLE communities_2;
  END IF;
END
$$;
