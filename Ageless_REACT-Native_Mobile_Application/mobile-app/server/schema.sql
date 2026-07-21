-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  goal TEXT, -- now stores either single goal string OR JSON array (multi-goal)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure existing installations widen column if previously VARCHAR(16)
ALTER TABLE users ALTER COLUMN goal TYPE TEXT;

-- Create entries table
CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  weight DECIMAL(5,2),
  fitness_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, entry_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create webauthn_credentials table for passkey/biometric login
CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  credential_id TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  counter BIGINT DEFAULT 0,
  transports TEXT DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webauthn_user ON webauthn_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_credential ON webauthn_credentials(credential_id);
