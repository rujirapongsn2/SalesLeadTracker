CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT DEFAULT 'New' NOT NULL,
  product TEXT DEFAULT '' NOT NULL,
  end_user_contact TEXT DEFAULT '' NOT NULL,
  end_user_organization TEXT DEFAULT '' NOT NULL,
  project_name TEXT DEFAULT '' NOT NULL,
  budget TEXT DEFAULT '' NOT NULL,
  created_at INTEGER,
  updated_at INTEGER,
  created_by TEXT DEFAULT 'Admin User',
  partner_contact TEXT DEFAULT '' NOT NULL,
  product_register TEXT DEFAULT '' NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' NOT NULL,
  avatar TEXT DEFAULT '' NOT NULL
);

-- Insert admin user
INSERT OR IGNORE INTO users (username, password, name, role)
VALUES ('admin', 'admin123', 'Alex Morgan', 'Administrator');

-- Insert sample users
INSERT OR IGNORE INTO users (username, password, name, role)
VALUES 
  ('john.doe', 'password123', 'John Doe', 'Sales Manager'),
  ('sarah.smith', 'password123', 'Sarah Smith', 'Sales Representative'),
  ('mike.wilson', 'password123', 'Mike Wilson', 'Sales Representative');
