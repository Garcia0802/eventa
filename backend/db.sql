CREATE DATABASE IF NOT EXISTS eventa_db;
USE eventa_db;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('PARTICIPANT', 'ORGANIZER') NOT NULL DEFAULT 'PARTICIPANT',
  city VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_role (role)
);

CREATE TABLE IF NOT EXISTS categories (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name),
  INDEX idx_categories_name (name)
);

CREATE TABLE IF NOT EXISTS events (
  id INT NOT NULL AUTO_INCREMENT,
  organizer_id INT NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  start_at DATETIME NOT NULL,
  venue VARCHAR(180) NOT NULL,
  city VARCHAR(100) NOT NULL,
  capacity INT NOT NULL,
  image_url VARCHAR(500) NULL,
  status ENUM('DRAFT', 'PUBLISHED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_events_organizer (organizer_id),
  INDEX idx_events_category (category_id),
  INDEX idx_events_status (status),
  CONSTRAINT fk_events_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_events_category FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CHECK (capacity > 0)
);

CREATE TABLE IF NOT EXISTS registrations (
  id INT NOT NULL AUTO_INCREMENT,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_registrations_event_user (event_id, user_id),
  INDEX idx_registrations_event (event_id),
  INDEX idx_registrations_user (user_id),
  INDEX idx_registrations_status (status),
  CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) REFERENCES events(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

INSERT INTO categories (name)
SELECT 'Esportes'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Esportes');

INSERT INTO categories (name)
SELECT 'Música'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Música');

INSERT INTO categories (name)
SELECT 'Tecnologia'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Tecnologia');

INSERT INTO categories (name)
SELECT 'Educação'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Educação');

INSERT INTO categories (name)
SELECT 'Gastronomia'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Gastronomia');

INSERT INTO categories (name)
SELECT 'Cultura'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Cultura');

INSERT INTO categories (name)
SELECT 'Lazer'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Lazer');

INSERT INTO categories (name)
SELECT 'Negócios'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Negócios');

INSERT INTO users (name, email, password_hash, role, city)
SELECT 'Maria Silva', 'maria@email.com', '$2b$10$iy9gL3xvxGZPae6kr3PpsOGeWtSKw5bua.AfxClpDrwXIsOJQcn/K', 'PARTICIPANT', 'São Paulo'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'maria@email.com');

INSERT INTO users (name, email, password_hash, role, city)
SELECT 'Ana Costa', 'ana@eventa.com', '$2b$10$AU8k2mcnqdlkpS9SM2vOuufGD3DaiTLAVH3RxMRYlekbpJQw6ar2W', 'ORGANIZER', 'Belo Horizonte'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ana@eventa.com');

INSERT INTO users (name, email, password_hash, role, city)
SELECT 'João Pereira', 'joao@email.com', '$2b$10$iy9gL3xvxGZPae6kr3PpsOGeWtSKw5bua.AfxClpDrwXIsOJQcn/K', 'PARTICIPANT', 'Rio de Janeiro'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'joao@email.com');

INSERT INTO events (organizer_id, category_id, title, description, start_at, venue, city, capacity, image_url, status)
SELECT u.id, c.id, 'Festival de Música Indie', 'Show com bandas locais, food trucks e área de descanso para o público.', '2026-11-22 19:00:00', 'Parque das Artes', 'Rio de Janeiro', 500,
'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80', 'PUBLISHED'
FROM users u, categories c
WHERE u.email = 'ana@eventa.com' AND c.name = 'Música'
AND NOT EXISTS (SELECT 1 FROM events WHERE title = 'Festival de Música Indie');

INSERT INTO events (organizer_id, category_id, title, description, start_at, venue, city, capacity, image_url, status)
SELECT u.id, c.id, 'Workshop de Programação para Iniciantes', 'Aula prática sobre lógica, JavaScript e criação de projetos do zero.', '2026-11-28 17:00:00', 'Campus Digital', 'Belo Horizonte', 80,
'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80', 'PUBLISHED'
FROM users u, categories c
WHERE u.email = 'ana@eventa.com' AND c.name = 'Tecnologia'
AND NOT EXISTS (SELECT 1 FROM events WHERE title = 'Workshop de Programação para Iniciantes');

INSERT INTO events (organizer_id, category_id, title, description, start_at, venue, city, capacity, image_url, status)
SELECT u.id, c.id, 'Feira Gastronômica do Bairro', 'Experiência gastronômica com comidas regionais e oficinas de preparo.', '2026-11-25 12:00:00', 'Praça Central', 'Curitiba', 350,
'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80', 'PUBLISHED'
FROM users u, categories c
WHERE u.email = 'ana@eventa.com' AND c.name = 'Gastronomia'
AND NOT EXISTS (SELECT 1 FROM events WHERE title = 'Feira Gastronômica do Bairro');

INSERT INTO events (organizer_id, category_id, title, description, start_at, venue, city, capacity, image_url, status)
SELECT u.id, c.id, 'Campeonato de Vôlei Universitário', 'Competição aberta para alunos e comunidade com premiação para os primeiros lugares.', '2026-11-18 18:30:00', 'Ginásio da Universidade', 'São Paulo', 200,
'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80', 'PUBLISHED'
FROM users u, categories c
WHERE u.email = 'ana@eventa.com' AND c.name = 'Esportes'
AND NOT EXISTS (SELECT 1 FROM events WHERE title = 'Campeonato de Vôlei Universitário');

INSERT INTO events (organizer_id, category_id, title, description, start_at, venue, city, capacity, image_url, status)
SELECT u.id, c.id, 'Palestra de Tecnologia e IA', 'Palestra com especialistas sobre inovação e transformação digital.', '2026-12-01 18:45:00', 'Auditório Central', 'Porto Alegre', 220,
'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80', 'PUBLISHED'
FROM users u, categories c
WHERE u.email = 'ana@eventa.com' AND c.name = 'Tecnologia'
AND NOT EXISTS (SELECT 1 FROM events WHERE title = 'Palestra de Tecnologia e IA');

INSERT INTO registrations (event_id, user_id, status)
SELECT e.id, u.id, 'CONFIRMED'
FROM events e, users u
WHERE e.title = 'Festival de Música Indie' AND u.email = 'maria@email.com'
AND NOT EXISTS (SELECT 1 FROM registrations WHERE event_id = e.id AND user_id = u.id);

INSERT INTO registrations (event_id, user_id, status)
SELECT e.id, u.id, 'CONFIRMED'
FROM events e, users u
WHERE e.title = 'Workshop de Programação para Iniciantes' AND u.email = 'joao@email.com'
AND NOT EXISTS (SELECT 1 FROM registrations WHERE event_id = e.id AND user_id = u.id);
