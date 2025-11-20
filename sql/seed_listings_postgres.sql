CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id)
);

ALTER TABLE listings ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE listings ADD COLUMN IF NOT EXISTS views INT NOT NULL DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS public_id TEXT UNIQUE;
UPDATE listings SET public_id = SUBSTRING(REPLACE(id::text, '-','') FROM 1 FOR 10) WHERE public_id IS NULL;
INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES
  (gen_random_uuid(), 'Ana Silva', 'ana.silva@example.com', encode(digest('123456','sha256'),'hex'), 'user', NOW()),
  (gen_random_uuid(), 'Bruno Souza', 'bruno.souza@example.com', encode(digest('123456','sha256'),'hex'), 'user', NOW()),
  (gen_random_uuid(), 'Carla Oliveira', 'carla.oliveira@example.com', encode(digest('123456','sha256'),'hex'), 'user', NOW()),
  (gen_random_uuid(), 'Diego Santos', 'diego.santos@example.com', encode(digest('123456','sha256'),'hex'), 'user', NOW()),
  (gen_random_uuid(), 'Eduarda Lima', 'eduarda.lima@example.com', encode(digest('123456','sha256'),'hex'), 'user', NOW()),
  (gen_random_uuid(), 'Felipe Alves', 'felipe.alves@example.com', encode(digest('123456','sha256'),'hex'), 'user', NOW()),
  (gen_random_uuid(), 'Gabriela Rocha', 'gabriela.rocha@example.com', encode(digest('123456','sha256'),'hex'), 'user', NOW()),
  (gen_random_uuid(), 'Henrique Costa', 'henrique.costa@example.com', encode(digest('123456','sha256'),'hex'), 'user', NOW()),
  (gen_random_uuid(), 'Isabela Martins', 'isabela.martins@example.com', encode(digest('123456','sha256'),'hex'), 'user', NOW()),
  (gen_random_uuid(), 'João Pereira', 'joao.pereira@example.com', encode(digest('123456','sha256'),'hex'), 'user', NOW()),
  (gen_random_uuid(), 'Karen Barbosa', 'karen.barbosa@example.com', encode(digest('123456','sha256'),'hex'), 'user', NOW()),
  (gen_random_uuid(), 'Lucas Fernandes', 'lucas.fernandes@example.com', encode(digest('123456','sha256'),'hex'), 'user', NOW())
ON CONFLICT (email) DO NOTHING;

-- Admin usuário inicial (hash compatível com backend: SHA-256)
INSERT INTO users (id, name, email, password_hash, role, created_at)
VALUES (gen_random_uuid(), 'Administrador', 'admin@site.com', encode(digest('admin123','sha256'),'hex'), 'admin', NOW())
ON CONFLICT (email) DO NOTHING;
WITH cities AS (
  SELECT * FROM (
    VALUES
      ('SP','São Paulo'),
      ('RJ','Rio de Janeiro'),
      ('MG','Belo Horizonte'),
      ('RS','Porto Alegre'),
      ('PR','Curitiba'),
      ('SC','Florianópolis'),
      ('BA','Salvador'),
      ('PE','Recife'),
      ('CE','Fortaleza'),
      ('GO','Goiânia'),
      ('DF','Brasília'),
      ('ES','Vitória'),
      ('PA','Belém'),
      ('AM','Manaus'),
      ('MA','São Luís'),
      ('PB','João Pessoa'),
      ('RN','Natal'),
      ('AL','Maceió'),
      ('SE','Aracaju'),
      ('PI','Teresina'),
      ('MT','Cuiabá'),
      ('MS','Campo Grande'),
      ('RO','Porto Velho'),
      ('RR','Boa Vista'),
      ('AP','Macapá'),
      ('TO','Palmas'),
      ('SP','Campinas'),
      ('RJ','Niterói'),
      ('RS','Caxias do Sul'),
      ('PR','Londrina')
  ) AS t(state, city)
), cats AS (
  SELECT * FROM (
    VALUES
      ('Imóveis'),
      ('Autos'),
      ('Eletrônicos'),
      ('Móveis'),
      ('Esportes'),
      ('Moda'),
      ('Serviços'),
      ('Pets'),
      ('Outros')
  ) AS c(category)
), nums AS (
  SELECT generate_series(1,30) AS n
)
INSERT INTO listings (id, public_id, title, description, price, category, images, city, state, owner_id, contact_phone, contact_email, created_at, views, is_active)
SELECT
  gen_random_uuid(),
  SUBSTRING(encode(digest(lower(cats.category)||'-'||nums.n::text,'sha256'),'hex') FROM 1 FOR 10),
  cats.category || ' ' || nums.n,
  'Anúncio de ' || lower(cats.category) || ' nº ' || nums.n || ' em excelente estado. Confira as fotos e entre em contato para mais detalhes.',
  ROUND((100 + (random()*9900))::numeric, 2),
  cats.category,
  jsonb_build_array(
    'https://picsum.photos/seed/' || replace(lower(cats.category),'ó','o') || nums.n || '/800/600',
    'https://picsum.photos/seed/' || replace(lower(cats.category),'ó','o') || nums.n || '-b/800/600',
    'https://picsum.photos/seed/' || replace(lower(cats.category),'ó','o') || nums.n || '-c/800/600'
  ),
  city_state.city,
  city_state.state,
  sel_user.id,
  '+55 ' || LPAD((10 + floor(random()*89))::text,2,'0') || ' 9' || LPAD(floor(random()*99999999)::text,8,'0'),
  sel_user.email,
  NOW() - (random()*30 || ' days')::interval,
  floor(random()*100),
  TRUE
FROM cats
CROSS JOIN nums
CROSS JOIN LATERAL (
  SELECT state, city FROM cities OFFSET ((nums.n - 1) % (SELECT count(*) FROM cities)) LIMIT 1
) AS city_state
CROSS JOIN LATERAL (
  SELECT id, email FROM users ORDER BY random() LIMIT 1
) AS sel_user
ON CONFLICT (public_id) DO NOTHING;
