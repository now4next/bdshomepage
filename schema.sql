-- BDS D1 Database Schema
-- Run: wrangler d1 execute bds-db --file=schema.sql --remote

-- 회원
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member',  -- 'admin' | 'member'
  created_at  TEXT DEFAULT (datetime('now'))
);

-- 세션 (로그인 토큰)
CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TEXT NOT NULL,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- 공지사항
CREATE TABLE IF NOT EXISTS notices (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  content     TEXT,
  is_public   INTEGER NOT NULL DEFAULT 0,  -- 0=회원전용, 1=전체공개
  created_at  TEXT DEFAULT (datetime('now')),
  created_by  TEXT REFERENCES users(id)
);

-- 문의 접수 (contact form 제출 저장)
CREATE TABLE IF NOT EXISTS contact_submissions (
  id              TEXT PRIMARY KEY,
  full_name       TEXT,
  email           TEXT,
  phone           TEXT,
  country         TEXT,
  grade_level     TEXT,
  inquiry_type    TEXT,
  contact_method  TEXT,
  message         TEXT,
  email_sent      INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now'))
);

-- 전자책
CREATE TABLE IF NOT EXISTS ebooks (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  r2_key        TEXT NOT NULL,          -- R2 오브젝트 키 (e.g. ebooks/uuid/original.pdf)
  thumbnail_key TEXT,                   -- R2 썸네일 키
  total_pages   INTEGER DEFAULT 0,
  required_role TEXT DEFAULT 'member',  -- 'member' | 'admin'
  is_active     INTEGER DEFAULT 1,
  created_at    TEXT DEFAULT (datetime('now')),
  created_by    TEXT REFERENCES users(id)
);

-- 열람 진행 상태 (이어읽기)
CREATE TABLE IF NOT EXISTS ebook_views (
  ebook_id    TEXT NOT NULL REFERENCES ebooks(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_page   INTEGER DEFAULT 1,
  updated_at  TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (ebook_id, user_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ebooks_active ON ebooks(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ebook_views_user ON ebook_views(user_id);

-- 초기 관리자 계정은 첫 회원가입 후 아래 SQL로 role 변경:
-- UPDATE users SET role = 'admin' WHERE email = 'admin@bdskorea.org';
