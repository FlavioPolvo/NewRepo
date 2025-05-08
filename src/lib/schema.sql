-- Reset tables if they exist
DROP TABLE IF EXISTS entries;
DROP TABLE IF EXISTS producers;
DROP TABLE IF EXISTS municipalities;
DROP TABLE IF EXISTS colors;

-- Create municipalities table
CREATE TABLE municipalities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create colors table for honey classification
CREATE TABLE colors (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    hex_color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create producers table
CREATE TABLE producers (
    id SERIAL PRIMARY KEY,
    cod_na_comapi VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(1),
    nickname VARCHAR(100),
    education_level VARCHAR(50),
    marital_status VARCHAR(20),
    address TEXT,
    municipality VARCHAR(100),
    community VARCHAR(100),
    uf VARCHAR(2),
    hive_quantity INTEGER,
    cooperative VARCHAR(100),
    affiliation_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    honey_production BOOLEAN DEFAULT TRUE,
    dap_expiration DATE,
    dap_number VARCHAR(50),
    property_size VARCHAR(50),
    certification_code VARCHAR(50),
    organic BOOLEAN DEFAULT FALSE,
    fair_trade BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create entries table
CREATE TABLE entries (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    producer_id INTEGER REFERENCES producers(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    gross_weight DECIMAL(10, 2) NOT NULL,
    net_weight DECIMAL(10, 2) NOT NULL,
    tare DECIMAL(10, 2) NOT NULL,
    total_tare DECIMAL(10, 2) NOT NULL,
    unit_value DECIMAL(10, 2) NOT NULL,
    total_value DECIMAL(10, 2) NOT NULL,
    color_code VARCHAR(10) REFERENCES colors(code),
    humidity DECIMAL(5, 2),
    apiary VARCHAR(100),
    lot VARCHAR(100),
    contract VARCHAR(100),
    ce VARCHAR(100),
    anal VARCHAR(100),
    prod VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data for municipalities
INSERT INTO municipalities (name, region) VALUES
('São Paulo', 'Sudeste'),
('Rio de Janeiro', 'Sudeste'),
('Belo Horizonte', 'Sudeste'),
('Salvador', 'Nordeste'),
('Recife', 'Nordeste');

-- Insert sample data for colors
INSERT INTO colors (code, name, hex_color) VALUES
('1', 'Branco Água', '#FFFFFF'),
('2', 'Extra Branco', '#FFFACD'),
('3', 'Branco', '#FFF8DC'),
('4', 'Âmbar Extra Claro', '#FFE4B5'),
('5', 'Âmbar Claro', '#FFD700'),
('6', 'Âmbar', '#DAA520'),
('7', 'Âmbar Escuro', '#B8860B');

-- Enable realtime for all tables
alter publication supabase_realtime add table municipalities;
alter publication supabase_realtime add table colors;
alter publication supabase_realtime add table producers;
alter publication supabase_realtime add table entries;
