CREATE DATABASE IF NOT EXISTS eventa_db;
USE eventa_db;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('PARTICIPANT', 'ORGANIZER', 'ADMIN') NOT NULL DEFAULT 'PARTICIPANT',
  city VARCHAR(100) NULL,
  category_1 VARCHAR(80) NULL,
  category_2 VARCHAR(80) NULL,
  category_3 VARCHAR(80) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_role (role)
);

CREATE TABLE IF NOT EXISTS organizer_requests (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  reason VARCHAR(300) NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_request_status (status),
  INDEX idx_request_user (user_id),
  INDEX idx_request_created (created_at),
  CONSTRAINT fk_request_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_request_admin FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE RESTRICT
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

ALTER TABLE users
  MODIFY COLUMN role ENUM('PARTICIPANT', 'ORGANIZER', 'ADMIN') NOT NULL DEFAULT 'PARTICIPANT';

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
