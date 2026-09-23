CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  answers JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'nouveau',
  owner TEXT NOT NULL DEFAULT '',
  next_action TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  submission_key TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  seq BIGSERIAL,
  lead_id TEXT NOT NULL REFERENCES leads(id),
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id),
  title TEXT NOT NULL,
  due_date TEXT NOT NULL,
  owner TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS reminders_due ON reminders(completed_at, due_date);
CREATE INDEX IF NOT EXISTS activities_lead ON activities(lead_id, created_at);
CREATE INDEX IF NOT EXISTS leads_created ON leads(created_at);
CREATE INDEX IF NOT EXISTS rate_limits_expires ON rate_limits(expires_at);
CREATE INDEX IF NOT EXISTS sessions_expires ON sessions(expires_at);
