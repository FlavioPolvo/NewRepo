-- First, let's modify the colors table without dropping it to maintain relationships
ALTER TABLE colors DROP COLUMN IF EXISTS name;
ALTER TABLE colors ADD COLUMN IF NOT EXISTS name VARCHAR(255);

ALTER TABLE colors DROP COLUMN IF EXISTS hex_color;
ALTER TABLE colors ADD COLUMN IF NOT EXISTS hex_color VARCHAR(7);

-- Clear existing data to avoid duplicates
TRUNCATE TABLE colors;

-- Insert color data with code, name, and hex_color based on the PDF
INSERT INTO colors (code, name, hex_color) VALUES
(1, 'WHITE', '#FFFFFF'),
(2, 'WHITE', '#FFFFFF'),
(3, 'WHITE', '#FFFFFF'),
(4, 'WHITE', '#FFFFFF'),
(5, 'WHITE', '#FFFFFF'),
(6, 'WHITE', '#FFFFFF'),
(7, 'WHITE', '#FFFFFF'),
(8, 'WHITE', '#FFFFFF'),
(9, 'WHITE', '#FFFFFF'),
(10, 'WHITE', '#FFFFFF'),
(11, 'WHITE', '#FFFFFF'),
(12, 'WHITE', '#FFFFFF'),
(13, 'WHITE', '#FFFFFF'),
(14, 'WHITE', '#FFFFFF'),
(15, 'WHITE', '#FFFFFF'),
(16, 'WHITE', '#FFFFFF'),
(17, 'WHITE', '#FFFFFF'),
(18, 'WHITE', '#FFFFFF'),
(19, 'WHITE', '#FFFFFF'),
(20, 'WHITE', '#FFFFFF'),
(21, 'WHITE', '#FFFFFF'),
(22, 'WHITE', '#FFFFFF'),
(23, 'WHITE', '#FFFFFF'),
(24, 'WHITE', '#FFFFFF'),
(25, 'WHITE', '#FFFFFF'),
(26, 'WHITE', '#FFFFFF'),
(27, 'WHITE', '#FFFFFF'),
(28, 'WHITE', '#FFFFFF'),
(29, 'WHITE', '#FFFFFF'),
(30, 'WHITE', '#FFFFFF'),
(31, 'WHITE', '#FFFFFF'),
(32, 'WHITE', '#FFFFFF'),
(33, 'WHITE', '#FFFFFF'),
(34, 'WHITE', '#FFFFFF'),
(35, 'ELA', '#FFF8DC'),
(36, 'ELA', '#FFF8DC'),
(37, 'ELA', '#FFF8DC'),
(38, 'ELA', '#FFF8DC'),
(39, 'ELA', '#FFF8DC'),
(40, 'ELA', '#FFF8DC'),
(41, 'ELA', '#FFF8DC'),
(42, 'ELA', '#FFF8DC'),
(43, 'ELA', '#FFF8DC'),
(44, 'ELA', '#FFF8DC'),
(45, 'ELA', '#FFF8DC'),
(46, 'ELA', '#FFF8DC'),
(47, 'ELA', '#FFF8DC'),
(48, 'ELA', '#FFF8DC'),
(49, 'ELA', '#FFF8DC'),
(50, 'ELA', '#FFF8DC'),
(51, 'LA', '#FFE4B5'),
(52, 'LA', '#FFE4B5'),
(53, 'LA', '#FFE4B5'),
(54, 'LA', '#FFE4B5'),
(55, 'LA', '#FFE4B5'),
(56, 'LA', '#FFE4B5'),
(57, 'LA', '#FFE4B5'),
(58, 'LA', '#FFE4B5'),
(59, 'LA', '#FFE4B5'),
(60, 'LA', '#FFE4B5'),
(61, 'LA', '#FFE4B5'),
(62, 'LA', '#FFE4B5'),
(63, 'LA', '#FFE4B5'),
(64, 'LA', '#FFE4B5'),
(65, 'LA', '#FFE4B5'),
(66, 'LA', '#FFE4B5'),
(67, 'LA', '#FFE4B5'),
(68, 'LA', '#FFE4B5'),
(69, 'LA', '#FFE4B5'),
(70, 'LA', '#FFE4B5'),
(71, 'LA', '#FFE4B5'),
(72, 'LA', '#FFE4B5'),
(73, 'LA', '#FFE4B5'),
(74, 'LA', '#FFE4B5'),
(75, 'LA', '#FFE4B5'),
(76, 'LA', '#FFE4B5'),
(77, 'LA', '#FFE4B5'),
(78, 'LA', '#FFE4B5'),
(79, 'LA', '#FFE4B5'),
(80, 'LA', '#FFE4B5'),
(81, 'LA', '#FFE4B5'),
(82, 'LA', '#FFE4B5'),
(83, 'LA', '#FFE4B5'),
(84, 'LA', '#FFE4B5'),
(85, 'LA', '#FFE4B5'),
(86, 'AMBAR', '#FFBF00'),
(87, 'AMBAR', '#FFBF00'),
(88, 'AMBAR', '#FFBF00'),
(89, 'AMBAR', '#FFBF00'),
(90, 'AMBAR', '#FFBF00'),
(91, 'AMBAR', '#FFBF00'),
(92, 'AMBAR', '#FFBF00'),
(93, 'AMBAR', '#FFBF00'),
(94, 'AMBAR', '#FFBF00'),
(95, 'AMBAR', '#FFBF00'),
(96, 'AMBAR', '#FFBF00'),
(97, 'AMBAR', '#FFBF00'),
(98, 'AMBAR', '#FFBF00'),
(99, 'AMBAR', '#FFBF00'),
(100, 'AMBAR', '#FFBF00'),
(101, 'AMBAR', '#FFBF00'),
(102, 'AMBAR', '#FFBF00'),
(103, 'AMBAR', '#FFBF00'),
(104, 'AMBAR', '#FFBF00'),
(105, 'AMBAR', '#FFBF00'),
(106, 'AMBAR', '#FFBF00'),
(107, 'AMBAR', '#FFBF00'),
(108, 'AMBAR', '#FFBF00'),
(109, 'AMBAR', '#FFBF00'),
(110, 'AMBAR', '#FFBF00'),
(111, 'AMBAR', '#FFBF00'),
(112, 'AMBAR', '#FFBF00'),
(113, 'AMBAR', '#FFBF00'),
(114, 'AMBAR', '#FFBF00'),
(115, 'DARK', '#CD853F'),
(116, 'DARK', '#CD853F'),
(117, 'DARK', '#CD853F'),
(118, 'DARK', '#CD853F'),
(119, 'DARK', '#CD853F'),
(120, 'DARK', '#CD853F'),
(121, 'DARK', '#CD853F'),
(122, 'DARK', '#CD853F'),
(123, 'DARK', '#CD853F'),
(124, 'DARK', '#CD853F'),
(125, 'DARK', '#CD853F'),
(126, 'DARK', '#CD853F'),
(127, 'DARK', '#CD853F'),
(128, 'DARK', '#CD853F'),
(129, 'DARK', '#CD853F'),
(130, 'DARK', '#CD853F'),
(131, 'DARK', '#CD853F'),
(132, 'DARK', '#CD853F'),
(133, 'DARK', '#CD853F'),
(134, 'DARK', '#CD853F'),
(135, 'DARK', '#CD853F'),
(136, 'DARK', '#CD853F'),
(137, 'DARK', '#CD853F'),
(138, 'DARK', '#CD853F'),
(139, 'DARK', '#CD853F'),
(140, 'DARK', '#CD853F'),
(141, 'DARK', '#CD853F'),
(142, 'DARK', '#CD853F'),
(143, 'DARK', '#CD853F'),
(144, 'DARK', '#CD853F'),
(145, 'DARK', '#CD853F'),
(146, 'DARK', '#CD853F'),
(147, 'DARK', '#CD853F'),
(148, 'DARK', '#CD853F'),
(149, 'DARK', '#CD853F'),
(150, 'DARK', '#CD853F'),
(151, 'DARK', '#CD853F'),
(152, 'DARK', '#CD853F'),
(153, 'DARK', '#CD853F'),
(154, 'DARK', '#CD853F'),
(155, 'DARK', '#CD853F'),
(156, 'DARK', '#CD853F'),
(157, 'DARK', '#CD853F');

-- Update municipalities table structure
ALTER TABLE municipalities DROP COLUMN IF EXISTS region;
ALTER TABLE municipalities ADD COLUMN IF NOT EXISTS region VARCHAR(100);

-- Clear existing data to avoid duplicates
TRUNCATE TABLE municipalities CASCADE;

-- Insert municipality data from the PDF
INSERT INTO municipalities (id, name, region) VALUES
(1, 'Bela Vista', 'Piauí'),
(2, 'Campinas do Piauí', 'Piauí'),
(3, 'Conceição do Canindé', 'Piauí'),
(4, 'Floresta do Piauí', 'Piauí'),
(5, 'Isaías Coelho', 'Piauí'),
(6, 'Nova Santa Rita do Piauí', 'Piauí'),
(7, 'Pedro Laurentino', 'Piauí'),
(8, 'Santo Inácio do Piauí', 'Piauí'),
(9, 'São Francisco de Assis do Piauí', 'Piauí'),
(10, 'Simplício Mendes', 'Piauí');

-- Update communities table structure
ALTER TABLE communities DROP COLUMN IF EXISTS municipality_id;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS municipality_id INTEGER;

-- Clear existing data to avoid duplicates
TRUNCATE TABLE communities;

-- Insert community data from the PDF
INSERT INTO communities (id, name, municipality_id) VALUES
(1, 'Aracatí', 7),
(2, 'Baixas', 9),
(3, 'Barra Bonita', 9),
(4, 'Barreiro Grande', 9),
(5, 'Betânia', 10),
(6, 'Boa Nova', 7),
(7, 'Canabrava', 5),
(8, 'Carreiras', 2),
(9, 'Extrema', 3),
(10, 'Gatinhos', 9),
(11, 'Jatobazeiro', 6),
(12, 'Joaquim Pequeno', 2),
(13, 'Ladeira', 1),
(14, 'Lagoa da Caridade', 10),
(15, 'Lagoa de gato', 4),
(16, 'Lagoa do juá', 9),
(17, 'Malhada', 1),
(18, 'Malhada do Juazeiro', 8),
(19, 'Mocambo', 5),
(20, 'Moreira', 10),
(21, 'Mulungú', 9),
(22, 'Nova Casa', 1),
(23, 'Patos', 1),
(24, 'Pinheiro', 3),
(25, 'Poço da Pedra', 2),
(26, 'Recreio', 5),
(27, 'Riacho Fundo', 5),
(28, 'Santa Luzia', 3),
(29, 'Santiago', 1),
(30, 'São José', 3),
(31, 'Sede Santo Inácio', 8),
(32, 'Sede São Francisco de Assis', 9),
(33, 'Sítio', 1),
(34, 'Sobradinho', 10),
(35, 'Varzea', 5),
(36, 'Volta do Riacho', 9);

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