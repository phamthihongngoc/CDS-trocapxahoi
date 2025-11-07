-- Social Welfare Support System Database Schema
-- Lang Son Province, Vietnam
-- SQLite Version

-- ========================================
-- 1. USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  citizen_id TEXT,
  date_of_birth TEXT,
  gender TEXT,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'CITIZEN',
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ========================================
-- 2. SUPPORT PROGRAMS
-- ========================================
CREATE TABLE IF NOT EXISTS support_programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  amount REAL,
  start_date TEXT,
  end_date TEXT,
  status TEXT DEFAULT 'active',
  created_by INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ========================================
-- 3. HOUSEHOLDS
-- ========================================
CREATE TABLE IF NOT EXISTS households (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  head_of_household_id INTEGER REFERENCES users(id),
  address TEXT,
  district TEXT,
  commune TEXT,
  village TEXT,
  household_type TEXT,
  income_level REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS household_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  household_id INTEGER REFERENCES households(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  citizen_id TEXT,
  date_of_birth TEXT,
  gender TEXT,
  relationship TEXT,
  occupation TEXT,
  disability_status TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ========================================
-- 4. APPLICATIONS
-- ========================================
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  program_id INTEGER REFERENCES support_programs(id),
  household_id INTEGER,
  citizen_id TEXT,
  full_name TEXT NOT NULL,
  date_of_birth TEXT,
  gender TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  district TEXT,
  commune TEXT,
  village TEXT,
  household_members_data TEXT,
  application_type TEXT,
  support_amount REAL,
  payment_schedule TEXT,
  payment_method TEXT,
  bank_account_holder TEXT,
  bank_account_number TEXT,
  bank_name TEXT,
  status TEXT DEFAULT 'pending',
  assigned_officer_id INTEGER REFERENCES users(id),
  submitted_at TEXT DEFAULT (datetime('now')),
  reviewed_at TEXT,
  approved_at TEXT,
  rejected_at TEXT,
  rejection_reason TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS application_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  document_type TEXT,
  file_name TEXT,
  file_path TEXT,
  file_size INTEGER,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS application_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  comment TEXT,
  performed_by INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

-- ========================================
-- 5. PAYOUTS
-- ========================================
CREATE TABLE IF NOT EXISTS payouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_code TEXT UNIQUE NOT NULL,
  program_id INTEGER REFERENCES support_programs(id),
  period TEXT,
  total_amount REAL,
  total_recipients INTEGER,
  status TEXT DEFAULT 'draft',
  created_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  approved_at TEXT,
  disbursed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payout_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payout_id INTEGER REFERENCES payouts(id) ON DELETE CASCADE,
  application_id INTEGER REFERENCES applications(id),
  beneficiary_name TEXT,
  citizen_id TEXT,
  amount REAL,
  payment_method TEXT,
  bank_account TEXT,
  status TEXT DEFAULT 'pending',
  paid_at TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ========================================
-- 6. COMPLAINTS
-- ========================================
CREATE TABLE IF NOT EXISTS complaints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  application_id INTEGER REFERENCES applications(id),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  assigned_to INTEGER REFERENCES users(id),
  resolved_at TEXT,
  resolution TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS complaint_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  comment TEXT,
  performed_by INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS complaint_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TEXT DEFAULT (datetime('now'))
);

-- ========================================
-- 7. NOTIFICATIONS
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT,
  link TEXT,
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ========================================
-- 8. ACTIVITY LOGS
-- ========================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id INTEGER,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ========================================
-- 9. SYSTEM SETTINGS
-- ========================================
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  type TEXT,
  description TEXT,
  updated_by INTEGER REFERENCES users(id),
  updated_at TEXT DEFAULT (datetime('now'))
);
