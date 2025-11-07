import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('🔧 Cập nhật CCCD cho admin và cán bộ...\n');

// Update admin
console.log('🔑 Cập nhật admin...');
try {
  const result = db.prepare(`
    UPDATE users 
    SET citizen_id = ?, full_name = ?
    WHERE email = ?
  `).run('035099123456', 'Hoàng Văn Tài', 'admin@langson.gov.vn');
  
  if (result.changes > 0) {
    console.log('  ✓ Admin: Hoàng Văn Tài (CCCD: 035099123456, Email: admin@langson.gov.vn)');
  }
} catch (error) {
  console.log(`  ✗ Lỗi: ${error.message}`);
}

// Update officers
console.log('\n👨‍💼 Cập nhật cán bộ...');

const officers = [
  { email: 'officer1@langson.gov.vn', cccd: '025088123456', name: 'Trần Văn Xuân' },
  { email: 'officer2@langson.gov.vn', cccd: '025088234567', name: 'Nguyễn Thị Yến' },
  { email: 'officer3@langson.gov.vn', cccd: '025088345678', name: 'Phạm Văn Zung' }
];

for (const officer of officers) {
  try {
    const result = db.prepare(`
      UPDATE users 
      SET citizen_id = ?, full_name = ?
      WHERE email = ?
    `).run(officer.cccd, officer.name, officer.email);
    
    if (result.changes > 0) {
      console.log(`  ✓ ${officer.name} (CCCD: ${officer.cccd}, Email: ${officer.email})`);
    } else {
      console.log(`  ⚠ Không tìm thấy user với email: ${officer.email}`);
    }
  } catch (error) {
    console.log(`  ✗ Lỗi cập nhật ${officer.email}: ${error.message}`);
  }
}

console.log('\n✅ Hoàn tất!');
console.log('\n📝 Bây giờ có thể đăng nhập bằng:');
console.log('  - Admin: CCCD=035099123456 hoặc Email=admin@langson.gov.vn');
console.log('  - Officer 1: CCCD=025088123456 hoặc Email=officer1@langson.gov.vn');
console.log('  - Officer 2: CCCD=025088234567 hoặc Email=officer2@langson.gov.vn');
console.log('  - Officer 3: CCCD=025088345678 hoặc Email=officer3@langson.gov.vn');
console.log('  - Password: 123456');

db.close();
