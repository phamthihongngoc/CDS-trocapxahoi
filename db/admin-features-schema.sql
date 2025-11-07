-- ========================================
-- ADMIN ADVANCED FEATURES SCHEMA
-- Phase 1-3 Implementation
-- ========================================

-- ========================================
-- AUDIT LOGS TABLE (Phase 1)
-- ========================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  action_type TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT'
  entity_type TEXT NOT NULL, -- 'APPLICATION', 'COMPLAINT', 'USER', 'PROGRAM', 'PAYOUT'
  entity_id INTEGER,
  old_value TEXT, -- JSON string of old data
  new_value TEXT, -- JSON string of new data
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'success', -- 'success', 'failed'
  message TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ========================================
-- PROGRAMS CONFIGURATION (Phase 1)
-- ========================================
CREATE TABLE IF NOT EXISTS programs_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id INTEGER REFERENCES support_programs(id),
  config_key TEXT NOT NULL, -- 'auto_approve', 'max_amount', 'eligibility_rules'
  config_value TEXT, -- JSON string for complex config
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ========================================
-- SYSTEM SETTINGS (Phase 1)
-- ========================================
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  category TEXT, -- 'general', 'security', 'notification', 'automation'
  data_type TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  description TEXT,
  is_public INTEGER DEFAULT 0, -- 0 = admin only, 1 = public
  updated_by INTEGER REFERENCES users(id),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ========================================
-- NOTIFICATIONS (Phase 2)
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id), -- NULL for broadcast
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  category TEXT, -- 'application', 'complaint', 'payout', 'system'
  related_entity_type TEXT,
  related_entity_id INTEGER,
  is_read INTEGER DEFAULT 0,
  sent_via TEXT DEFAULT 'web', -- 'web', 'email', 'sms'
  sent_at TEXT,
  read_at TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ========================================
-- NOTIFICATION TEMPLATES (Phase 2)
-- ========================================
CREATE TABLE IF NOT EXISTS notification_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  template_type TEXT DEFAULT 'email', -- 'email', 'sms', 'web'
  subject TEXT,
  content TEXT NOT NULL, -- Support variables like {{user_name}}, {{application_id}}
  variables TEXT, -- JSON array of available variables
  is_active INTEGER DEFAULT 1,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ========================================
-- OFFICER PERFORMANCE METRICS (Phase 2)
-- ========================================
CREATE TABLE IF NOT EXISTS officer_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  officer_id INTEGER REFERENCES users(id),
  metric_date TEXT NOT NULL, -- YYYY-MM-DD
  applications_assigned INTEGER DEFAULT 0,
  applications_completed INTEGER DEFAULT 0,
  applications_approved INTEGER DEFAULT 0,
  applications_rejected INTEGER DEFAULT 0,
  complaints_assigned INTEGER DEFAULT 0,
  complaints_resolved INTEGER DEFAULT 0,
  avg_processing_time REAL, -- in hours
  rating REAL, -- 0-5 stars
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_officer_metrics_officer ON officer_metrics(officer_id);
CREATE INDEX idx_officer_metrics_date ON officer_metrics(metric_date);

-- ========================================
-- BACKUPS (Phase 3)
-- ========================================
CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  backup_name TEXT NOT NULL,
  backup_type TEXT DEFAULT 'manual', -- 'manual', 'auto', 'scheduled'
  file_path TEXT,
  file_size INTEGER, -- in bytes
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
  error_message TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT
);

-- ========================================
-- SECURITY SETTINGS (Phase 3)
-- ========================================
CREATE TABLE IF NOT EXISTS security_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  event_type TEXT NOT NULL, -- 'login_failed', 'password_changed', 'ip_blocked', '2fa_enabled'
  ip_address TEXT,
  user_agent TEXT,
  details TEXT, -- JSON string
  severity TEXT DEFAULT 'info', -- 'info', 'warning', 'critical'
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_security_logs_user ON security_logs(user_id);
CREATE INDEX idx_security_logs_event ON security_logs(event_type);
CREATE INDEX idx_security_logs_created ON security_logs(created_at);

-- ========================================
-- AUTOMATION RULES (Phase 3)
-- ========================================
CREATE TABLE IF NOT EXISTS automation_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'auto_assignment', 'auto_approval', 'scheduled_task'
  trigger_event TEXT, -- 'new_application', 'application_pending_7days', 'daily_9am'
  conditions TEXT, -- JSON string of conditions
  actions TEXT, -- JSON string of actions to perform
  is_active INTEGER DEFAULT 1,
  last_run_at TEXT,
  next_run_at TEXT,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ========================================
-- SCHEDULED TASKS (Phase 3)
-- ========================================
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_name TEXT NOT NULL,
  task_type TEXT NOT NULL, -- 'backup', 'report', 'notification', 'cleanup'
  schedule TEXT, -- cron format: '0 9 * * *'
  parameters TEXT, -- JSON string
  is_active INTEGER DEFAULT 1,
  last_run_at TEXT,
  last_status TEXT, -- 'success', 'failed', 'running'
  next_run_at TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ========================================
-- SYSTEM ALERTS (Phase 1)
-- ========================================
CREATE TABLE IF NOT EXISTS system_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alert_type TEXT NOT NULL, -- 'overdue_application', 'pending_complaint', 'low_budget', 'system_error'
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  message TEXT,
  entity_type TEXT,
  entity_id INTEGER,
  is_resolved INTEGER DEFAULT 0,
  resolved_by INTEGER REFERENCES users(id),
  resolved_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_system_alerts_type ON system_alerts(alert_type);
CREATE INDEX idx_system_alerts_resolved ON system_alerts(is_resolved);

-- ========================================
-- OFFICER WORKLOAD (Phase 2)
-- ========================================
CREATE TABLE IF NOT EXISTS officer_workload (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  officer_id INTEGER REFERENCES users(id),
  current_applications INTEGER DEFAULT 0,
  current_complaints INTEGER DEFAULT 0,
  pending_approvals INTEGER DEFAULT 0,
  total_workload REAL DEFAULT 0, -- weighted score
  status TEXT DEFAULT 'available', -- 'available', 'busy', 'overloaded'
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_officer_workload_officer ON officer_workload(officer_id);

-- ========================================
-- Insert Default System Settings
-- ========================================
INSERT OR IGNORE INTO system_settings (setting_key, setting_value, category, data_type, description) VALUES
('site_name', 'Hệ Thống Trợ Cấp Xã Hội', 'general', 'string', 'Tên hệ thống'),
('timezone', 'Asia/Ho_Chi_Minh', 'general', 'string', 'Múi giờ'),
('max_login_attempts', '5', 'security', 'number', 'Số lần đăng nhập sai tối đa'),
('session_timeout', '3600', 'security', 'number', 'Thời gian timeout session (giây)'),
('enable_2fa', 'false', 'security', 'boolean', 'Bật xác thực 2 yếu tố'),
('auto_backup_enabled', 'true', 'automation', 'boolean', 'Tự động backup'),
('auto_backup_time', '02:00', 'automation', 'string', 'Thời gian backup tự động'),
('auto_assignment_enabled', 'false', 'automation', 'boolean', 'Tự động phân công hồ sơ'),
('email_notifications', 'true', 'notification', 'boolean', 'Gửi email thông báo'),
('sms_notifications', 'false', 'notification', 'boolean', 'Gửi SMS thông báo');

-- ========================================
-- Insert Default Notification Templates
-- ========================================
INSERT OR IGNORE INTO notification_templates (name, code, template_type, subject, content, variables) VALUES
('Thông báo hồ sơ được duyệt', 'APPLICATION_APPROVED', 'email', 
 'Hồ sơ trợ cấp của bạn đã được phê duyệt', 
 'Xin chào {{user_name}},\n\nHồ sơ trợ cấp #{{application_id}} của bạn đã được phê duyệt.\nChương trình: {{program_name}}\nSố tiền: {{amount}} VNĐ\n\nTrân trọng.',
 '["user_name", "application_id", "program_name", "amount"]'),

('Thông báo hồ sơ bị từ chối', 'APPLICATION_REJECTED', 'email',
 'Hồ sơ trợ cấp của bạn đã bị từ chối',
 'Xin chào {{user_name}},\n\nHồ sơ trợ cấp #{{application_id}} của bạn đã bị từ chối.\nLý do: {{reason}}\n\nBạn có thể nộp lại hồ sơ sau khi khắc phục.\n\nTrân trọng.',
 '["user_name", "application_id", "reason"]'),

('Nhắc nhở nộp hồ sơ', 'APPLICATION_REMINDER', 'email',
 'Nhắc nhở hoàn thiện hồ sơ trợ cấp',
 'Xin chào {{user_name}},\n\nHồ sơ #{{application_id}} của bạn đang ở trạng thái chờ xử lý.\nVui lòng kiểm tra và bổ sung thông tin nếu cần.\n\nTrân trọng.',
 '["user_name", "application_id"]');
