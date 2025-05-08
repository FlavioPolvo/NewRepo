-- First, let's modify the colors table without dropping it to maintain relationships
ALTER TABLE colors DROP COLUMN IF EXISTS name;
ALTER TABLE colors ADD COLUMN IF NOT EXISTS name VARCHAR(255);

ALTER TABLE colors DROP COLUMN IF EXISTS hex_color;
ALTER TABLE colors ADD COLUMN IF NOT EXISTS hex_color VARCHAR(7);

-- Clear existing data to avoid duplicates
TRUNCATE TABLE colors;

-- Insert color data with code, name, and hex_color
INSERT INTO colors (code, name, hex_color) VALUES
(1, 'Branco água', '#FFFFFF'),
(2, 'Extra branco', '#FFFAFA'),
(3, 'Branco', '#F8F8FF'),
(4, 'Âmbar extra claro', '#FFEFD5'),
(5, 'Âmbar claro', '#FFE4B5'),
(6, 'Âmbar', '#FFBF00'),
(7, 'Âmbar escuro', '#CD853F');

-- Update municipalities table structure
ALTER TABLE municipalities DROP COLUMN IF EXISTS region;
ALTER TABLE municipalities ADD COLUMN IF NOT EXISTS region VARCHAR(100);

-- Clear existing data to avoid duplicates
TRUNCATE TABLE municipalities CASCADE;

-- Insert municipality data
INSERT INTO municipalities (id, name, region) VALUES
(1, 'Abaetetuba', 'Nordeste'),
(2, 'Abel Figueiredo', 'Sudeste'),
(3, 'Acará', 'Nordeste'),
(4, 'Afuá', 'Marajó'),
(5, 'Água Azul do Norte', 'Sudeste'),
(6, 'Alenquer', 'Baixo Amazonas'),
(7, 'Almeirim', 'Baixo Amazonas'),
(8, 'Altamira', 'Sudoeste'),
(9, 'Anajás', 'Marajó'),
(10, 'Ananindeua', 'Metropolitana'),
(11, 'Anapu', 'Sudoeste'),
(12, 'Augusto Corrêa', 'Nordeste'),
(13, 'Aurora do Pará', 'Nordeste'),
(14, 'Aveiro', 'Sudoeste'),
(15, 'Bagre', 'Marajó');

-- Update communities table structure
ALTER TABLE communities DROP COLUMN IF EXISTS municipality_id;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS municipality_id INTEGER;

-- Clear existing data to avoid duplicates
TRUNCATE TABLE communities;

-- Insert community data
INSERT INTO communities (id, name, municipality_id) VALUES
(1, 'Centro', 1),
(2, 'Vila Nova', 1),
(3, 'São José', 2),
(4, 'Santa Maria', 2),
(5, 'Bom Jesus', 3),
(6, 'São Francisco', 3),
(7, 'Nossa Senhora Aparecida', 4),
(8, 'Santo Antônio', 4),
(9, 'São Pedro', 5),
(10, 'Santa Luzia', 5),
(11, 'São João', 6),
(12, 'São Benedito', 7),
(13, 'Santa Rita', 8),
(14, 'São Miguel', 9),
(15, 'Santa Clara', 10);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'communities_municipality_id_fkey') THEN
    ALTER TABLE communities ADD CONSTRAINT communities_municipality_id_fkey
    FOREIGN KEY (municipality_id) REFERENCES municipalities(id);
  END IF;
END
$$;

-- Enable realtime for these tables conditionally
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'colors') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE colors';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'municipalities') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE municipalities';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'communities') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE communities';
  END IF;
END
$$;
