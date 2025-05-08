-- Drop existing tables with CASCADE to handle dependencies
DROP TABLE IF EXISTS municipalities CASCADE;
DROP TABLE IF EXISTS communities CASCADE;
DROP TABLE IF EXISTS colors CASCADE;

-- Create municipalities table
CREATE TABLE IF NOT EXISTS municipalities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(255)
);

-- Create communities table
CREATE TABLE IF NOT EXISTS communities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    municipality_id INTEGER REFERENCES municipalities(id)
);

-- Create colors table
CREATE TABLE IF NOT EXISTS colors (
    id SERIAL PRIMARY KEY,
    code INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    hex_color VARCHAR(7) NOT NULL
);

-- Insert municipalities data
INSERT INTO municipalities (id, name, region) VALUES
(1, 'São Paulo', 'Sudeste'),
(2, 'Rio de Janeiro', 'Sudeste'),
(3, 'Belo Horizonte', 'Sudeste'),
(4, 'Salvador', 'Nordeste'),
(5, 'Recife', 'Nordeste');

-- Insert communities data
INSERT INTO communities (id, name, municipality_id) VALUES
(1, 'Comunidade A', 1),
(2, 'Comunidade B', 1),
(3, 'Comunidade C', 2),
(4, 'Comunidade D', 2),
(5, 'Comunidade E', 3),
(6, 'Comunidade F', 4),
(7, 'Comunidade G', 5);

-- Insert color classification data
INSERT INTO colors (code, name, hex_color) VALUES
(1, 'WHITE', '#FFFFFF'),
(2, 'ELA', '#FFEB3B'),
(3, 'LA', '#FFC107'),
(4, 'AMBAR', '#FF9800'),
(5, 'DARK', '#795548');

-- Update entries table to use color_code as foreign key if it doesn't already
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'entries_color_code_fkey'
    ) THEN
        ALTER TABLE entries ADD CONSTRAINT entries_color_code_fkey 
        FOREIGN KEY (color_code) REFERENCES colors(code);
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error updating entries table: %', SQLERRM;
END $$;

-- Enable realtime for these tables
alter publication supabase_realtime add table municipalities;
alter publication supabase_realtime add table communities;
alter publication supabase_realtime add table colors;