CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 VARCHAR(200) NOT NULL,
  email                VARCHAR(200) UNIQUE NOT NULL,
  password_hash        TEXT NOT NULL,
  phone                VARCHAR(20) NOT NULL,
  industry             VARCHAR(100),
  bio                  TEXT,
  verification_type    VARCHAR(20) NOT NULL DEFAULT 'pending',
  verification_status  VARCHAR(20) NOT NULL DEFAULT 'pending',
  verification_notes   TEXT,
  din_number           VARCHAR(20),
  din_director_name    VARCHAR(200),
  linkedin_url         TEXT,
  succession_prev_din  VARCHAR(20),
  succession_new_din   VARCHAR(20),
  succession_doc_note  TEXT,
  is_admin             BOOLEAN DEFAULT FALSE,
  lat                  DECIMAL(10,7),
  lng                  DECIMAL(10,7),
  city                 VARCHAR(100),
  is_active            BOOLEAN DEFAULT TRUE,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE connection_requests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

CREATE TABLE connections (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a_id, user_b_id),
  CHECK (user_a_id != user_b_id)
);

CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_system   BOOLEAN DEFAULT FALSE,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_verification ON users(verification_status);
CREATE INDEX idx_users_location ON users(lat, lng);
CREATE INDEX idx_conn_req_sender ON connection_requests(sender_id);
CREATE INDEX idx_conn_req_receiver ON connection_requests(receiver_id);
CREATE INDEX idx_connections_a ON connections(user_a_id);
CREATE INDEX idx_connections_b ON connections(user_b_id);
CREATE INDEX idx_messages_convo ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_conn_req_updated BEFORE UPDATE ON connection_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE users ADD COLUMN IF NOT EXISTS founder_name VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS looking_for TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_goal VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_size VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS revenue_range VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_interests TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS year_founded VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_type VARCHAR(20) NOT NULL DEFAULT 'other',
  event_date TIMESTAMPTZ NOT NULL,
  location VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);

ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_logo TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS headline VARCHAR(300);
ALTER TABLE users ADD COLUMN IF NOT EXISTS share_slug VARCHAR(200) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;