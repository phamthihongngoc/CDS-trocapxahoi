import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'socialwelfare.db');
const db = new Database(dbPath);

console.log('📊 Checking database tables...\n');

const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' 
  ORDER BY name
`).all();

console.log(`Total tables: ${tables.length}\n`);

// Check for admin feature tables
const adminTables = [
  'audit_logs', 'programs_config', 'system_settings', 
  'notifications', 'notification_templates', 'officer_metrics',
  'backups', 'security_logs', 'automation_rules', 
  'scheduled_tasks', 'system_alerts', 'officer_workload'
];

console.log('Admin Feature Tables:');
adminTables.forEach(tableName => {
  const exists = tables.some(t => t.name === tableName);
  console.log(`  ${exists ? '✅' : '❌'} ${tableName}`);
});

// Count data
if (tables.some(t => t.name === 'system_settings')) {
  const settings = db.prepare('SELECT COUNT(*) as count FROM system_settings').get();
  console.log(`\n📝 System Settings: ${settings.count} records`);
}

if (tables.some(t => t.name === 'notification_templates')) {
  const templates = db.prepare('SELECT COUNT(*) as count FROM notification_templates').get();
  console.log(`📧 Notification Templates: ${templates.count} records`);
}

db.close();
console.log('\n✅ Done!');
