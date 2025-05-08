-- Criação da tabela de Produtores
CREATE TABLE producers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cod_na_comapi TEXT UNIQUE,
    municipality TEXT,
    community TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criação da tabela de Cores
CREATE TABLE colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    hex_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criação da tabela de Municípios
CREATE TABLE municipalities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    region TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criação da tabela de Entradas
CREATE TABLE entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    producer_id UUID REFERENCES producers(id),
    municipality_id INTEGER REFERENCES municipalities(id),
    color_code TEXT REFERENCES colors(code),
    quantity INTEGER NOT NULL,
    gross_weight DECIMAL(10, 2) NOT NULL,
    tare DECIMAL(10, 2) NOT NULL,
    net_weight DECIMAL(10, 2) NOT NULL,
    unit_value DECIMAL(10, 2) NOT NULL,
    total_value DECIMAL(10, 2) NOT NULL,
    humidity DECIMAL(5, 2),
    apiary TEXT,
    lot TEXT,
    contract TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

