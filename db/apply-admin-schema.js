import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'socialwelfare.db');
const db = new Database(dbPath);

console.log('🔧 Applying Admin Features Schema...\n');

try {
  // Read the schema file
  const schemaPath = path.join(__dirname, 'admin-features-schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Execute the entire schema at once
  db.exec(schema);

  console.log(`✅ Schema applied successfully!`);

  // Verify tables exist
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    AND name IN (
      'audit_logs', 'programs_config', 'system_settings', 
      'notifications', 'notification_templates', 'officer_metrics',
      'backups', 'security_logs', 'automation_rules', 
      'scheduled_tasks', 'system_alerts', 'officer_workload'
    )
    ORDER BY name
  `).all();

  console.log(`\n📋 New tables created (${tables.length}):`);
  tables.forEach(t => console.log(`   ✅ ${t.name}`));

  // Count settings and templates
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM system_settings').get();
  const templatesCount = db.prepare('SELECT COUNT(*) as count FROM notification_templates').get();
  
  console.log(`\n📊 Data inserted:`);
  console.log(`   - System settings: ${settingsCount.count}`);
  console.log(`   - Notification templates: ${templatesCount.count}`);
  
  console.log(`\n🎉 Admin features ready!`);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  db.close();
}
