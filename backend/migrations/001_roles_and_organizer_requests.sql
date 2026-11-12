USE eventa_db;

ALTER TABLE users
  MODIFY COLUMN role ENUM('PARTICIPANT', 'ORGANIZER', 'ADMIN') NOT NULL DEFAULT 'PARTICIPANT';

CREATE TABLE IF NOT EXISTS organizer_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  reason VARCHAR(300) NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  reviewed_by BIGINT UNSIGNED NULL,
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

SELECT 'Migração aplicada com sucesso: roles e solicitações de organizador.' AS status;
