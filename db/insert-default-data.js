import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'socialwelfare.db');
const db = new Database(dbPath);

console.log('📝 Inserting default data...\n');

try {
  // Disable foreign keys temporarily
  db.pragma('foreign_keys = OFF');
  
  // System Settings
  const settingsData = [
    ['site_name', 'Hệ Thống Trợ Cấp Xã Hội', 'general', 'string', 'Tên hệ thống'],
    ['timezone', 'Asia/Ho_Chi_Minh', 'general', 'string', 'Múi giờ'],
    ['max_login_attempts', '5', 'security', 'number', 'Số lần đăng nhập sai tối đa'],
    ['session_timeout', '3600', 'security', 'number', 'Thời gian timeout session (giây)'],
    ['enable_2fa', 'false', 'security', 'boolean', 'Bật xác thực 2 yếu tố'],
    ['auto_backup_enabled', 'true', 'automation', 'boolean', 'Tự động backup'],
    ['auto_backup_time', '02:00', 'automation', 'string', 'Thời gian backup tự động'],
    ['auto_assignment_enabled', 'false', 'automation', 'boolean', 'Tự động phân công hồ sơ'],
    ['email_notifications', 'true', 'notification', 'boolean', 'Gửi email thông báo'],
    ['sms_notifications', 'false', 'notification', 'boolean', 'Gửi SMS thông báo']
  ];

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO system_settings (setting_key, setting_value, category, data_type, description, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);

  settingsData.forEach(data => {
    insertSetting.run(data);
  });
  console.log(`✅ Inserted ${settingsData.length} system settings`);

  // Notification Templates
  const templatesData = [
    [
      'Thông báo hồ sơ được duyệt',
      'APPLICATION_APPROVED',
      'email',
      'Hồ sơ trợ cấp của bạn đã được phê duyệt',
      'Xin chào {{user_name}},\n\nHồ sơ trợ cấp #{{application_id}} của bạn đã được phê duyệt.\nChương trình: {{program_name}}\nSố tiền: {{amount}} VNĐ\n\nTrân trọng.',
      JSON.stringify(['user_name', 'application_id', 'program_name', 'amount'])
    ],
    [
      'Thông báo hồ sơ bị từ chối',
      'APPLICATION_REJECTED',
      'email',
      'Hồ sơ trợ cấp của bạn đã bị từ chối',
      'Xin chào {{user_name}},\n\nHồ sơ trợ cấp #{{application_id}} của bạn đã bị từ chối.\nLý do: {{reason}}\n\nBạn có thể nộp lại hồ sơ sau khi khắc phục.\n\nTrân trọng.',
      JSON.stringify(['user_name', 'application_id', 'reason'])
    ],
    [
      'Nhắc nhở nộp hồ sơ',
      'APPLICATION_REMINDER',
      'email',
      'Nhắc nhở hoàn thiện hồ sơ trợ cấp',
      'Xin chào {{user_name}},\n\nHồ sơ #{{application_id}} của bạn đang ở trạng thái chờ xử lý.\nVui lòng kiểm tra và bổ sung thông tin nếu cần.\n\nTrân trọng.',
      JSON.stringify(['user_name', 'application_id'])
    ],
    [
      'Thông báo khiếu nại đã được xử lý',
      'COMPLAINT_RESOLVED',
      'email',
      'Khiếu nại của bạn đã được xử lý',
      'Xin chào {{user_name}},\n\nKhiếu nại #{{complaint_id}} của bạn đã được xử lý.\nKết quả: {{result}}\n\nTrân trọng.',
      JSON.stringify(['user_name', 'complaint_id', 'result'])
    ],
    [
      'Thông báo chi trả',
      'PAYOUT_COMPLETED',
      'email',
      'Thông báo chi trả trợ cấp',
      'Xin chào {{user_name}},\n\nSố tiền trợ cấp {{amount}} VNĐ đã được chuyển vào tài khoản của bạn.\nHồ sơ: #{{application_id}}\n\nTrân trọng.',
      JSON.stringify(['user_name', 'application_id', 'amount'])
    ]
  ];

  const insertTemplate = db.prepare(`
    INSERT OR IGNORE INTO notification_templates (name, code, template_type, subject, content, variables, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  templatesData.forEach(data => {
    insertTemplate.run(data);
  });
  console.log(`✅ Inserted ${templatesData.length} notification templates`);

  // Re-enable foreign keys
  db.pragma('foreign_keys = ON');

  console.log('\n🎉 Default data inserted successfully!');

} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  db.close();
}
