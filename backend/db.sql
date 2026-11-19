/*
  Eventa - recriação completa do banco de dados

  Resultado:
  - Todas as tabelas são recriadas vazias.
  - Existe somente 1 usuário inicial: admin@gmail.com.
  - Senha do usuário: 12345678
  - Não existem categorias, eventos, inscrições ou solicitações cadastrados.
*/

CREATE DATABASE IF NOT EXISTS eventa_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE eventa_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS organizer_requests;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('PARTICIPANT', 'ORGANIZER', 'ADMIN') NOT NULL DEFAULT 'PARTICIPANT',
  city VARCHAR(100) NULL,
  category_1 VARCHAR(80) NULL,
  category_2 VARCHAR(80) NULL,
  category_3 VARCHAR(80) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name),
  KEY idx_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE organizer_requests (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  reason VARCHAR(300) NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_request_status (status),
  KEY idx_request_user (user_id),
  KEY idx_request_admin (reviewed_by),
  KEY idx_request_created (created_at),
  CONSTRAINT fk_request_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_request_admin
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE events (
  id INT NOT NULL AUTO_INCREMENT,
  organizer_id INT NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  start_at DATETIME NOT NULL,
  end_at DATETIME NULL,
  venue VARCHAR(180) NOT NULL,
  city VARCHAR(100) NOT NULL,
  capacity INT NOT NULL,
  image_url VARCHAR(500) NULL,
  status ENUM('DRAFT', 'PUBLISHED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_events_organizer (organizer_id),
  KEY idx_events_category (category_id),
  KEY idx_events_status (status),
  KEY idx_events_start_at (start_at),
  CONSTRAINT fk_events_organizer
    FOREIGN KEY (organizer_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_events_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_events_capacity CHECK (capacity > 0),
  CONSTRAINT chk_events_end_after_start CHECK (end_at IS NULL OR end_at > start_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE registrations (
  id INT NOT NULL AUTO_INCREMENT,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_registrations_event_user (event_id, user_id),
  KEY idx_registrations_event (event_id),
  KEY idx_registrations_user (user_id),
  KEY idx_registrations_status (status),
  CONSTRAINT fk_registrations_event
    FOREIGN KEY (event_id) REFERENCES events(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_registrations_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* Único usuário incluído no banco. Senha: 12345678 */
INSERT INTO users (name, email, password_hash, role, city)
VALUES (
  'Administrador',
  'admin@gmail.com',
  '$2b$10$O75OJmQj1.ELj1c7hNlOpu67SK6X3gWMs6sNidVg.GysbXawZ5X7G',
  'ADMIN',
  NULL
);

/* Categorias iniciais */
INSERT IGNORE INTO categories (name) VALUES
  ('Esportes'),
  ('Música'),
  ('Tecnologia'),
  ('Educação'),
  ('Gastronomia'),
  ('Cultura'),
  ('Lazer'),
  ('Negócios');
