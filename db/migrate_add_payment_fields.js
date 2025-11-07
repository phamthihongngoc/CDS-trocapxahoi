import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../database.sqlite');

console.log('🔧 Adding payment fields to applications table...');
console.log('📍 Database:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Check if columns exist
  const tableInfo = db.pragma('table_info(applications)');
  const existingCols = tableInfo.map(col => col.name);
  
  const newCols = [
    { name: 'payment_schedule', type: 'TEXT' },
    { name: 'payment_method', type: 'TEXT' },
    { name: 'bank_account_holder', type: 'TEXT' },
    { name: 'bank_account_number', type: 'TEXT' },
    { name: 'bank_name', type: 'TEXT' }
  ];
  
  newCols.forEach(col => {
    if (!existingCols.includes(col.name)) {
      console.log(`  Adding column: ${col.name}`);
      db.exec(`ALTER TABLE applications ADD COLUMN ${col.name} ${col.type}`);
    } else {
      console.log(`  ✓ Column ${col.name} already exists`);
    }
  });
  
  db.close();
  console.log('✅ Migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
