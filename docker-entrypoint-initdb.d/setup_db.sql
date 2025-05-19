-- enable foreign keys
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
	  id                INTEGER PRIMARY KEY AUTOINCREMENT,
	  username          TEXT    NOT NULL UNIQUE,
	  password          TEXT    NOT NULL,
	  name              TEXT    NOT NULL,
	  role              TEXT    NOT NULL DEFAULT 'user',
	  avatar            TEXT    NOT NULL DEFAULT '',
	  created_at        INTEGER NOT NULL DEFAULT (strftime('%s','now')),
	  updated_at        INTEGER NOT NULL DEFAULT (strftime('%s','now'))
	);

	-- Leads table
CREATE TABLE IF NOT EXISTS leads (
	  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
	  name                  TEXT    NOT NULL,
	  company               TEXT    NOT NULL,
	  email                 TEXT    NOT NULL,
	  phone                 TEXT    NOT NULL,
	  source                TEXT    NOT NULL,
	  status                TEXT    NOT NULL DEFAULT 'New',
	  product               TEXT    NOT NULL DEFAULT '',
	  end_user_contact      TEXT    NOT NULL DEFAULT '',
	  end_user_organization TEXT    NOT NULL DEFAULT '',
	  project_name          TEXT    NOT NULL DEFAULT '',
	  budget                TEXT    NOT NULL DEFAULT '',
	  created_at            INTEGER NOT NULL DEFAULT (strftime('%s','now')),
	  updated_at            INTEGER NOT NULL DEFAULT (strftime('%s','now')),
	  created_by            TEXT    NOT NULL DEFAULT 'Admin User',
	  created_by_id         INTEGER NOT NULL DEFAULT 0,
	  partner_contact       TEXT    NOT NULL DEFAULT '',
	  product_register      TEXT    NOT NULL DEFAULT ''
	);

	-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
	  id          INTEGER PRIMARY KEY AUTOINCREMENT,
	  key         TEXT    NOT NULL UNIQUE,
	  name        TEXT    NOT NULL,
	  user_id     INTEGER NOT NULL,
	  created_at  INTEGER NOT NULL DEFAULT (strftime('%s','now')),
	  last_used   INTEGER,
	  is_active   INTEGER NOT NULL DEFAULT 1,
	  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
	);

	-- Indexes (if not automatically created by Drizzle)
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS api_keys_key_unique  ON api_keys(key);

-- Seed admin + sample users
INSERT OR IGNORE INTO users (username, password, name, role)
VALUES
  ('admin',       'admin123',  'Alex Morgan',      'Administrator'),
  ('john.doe',    'password123','John Doe',         'Sales Manager'),
  ('sarah.smith','password123','Sarah Smith',      'Sales Representative'),
  ('mike.wilson','password123','Mike Wilson',      'Sales Representative');
