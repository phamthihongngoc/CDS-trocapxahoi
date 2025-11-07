import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('🔧 Thêm cột location vào bảng payouts...\n');

try {
  // Kiểm tra xem cột location đã tồn tại chưa
  const tableInfo = db.prepare("PRAGMA table_info(payouts)").all();
  const hasLocation = tableInfo.some(col => col.name === 'location');
  
  if (hasLocation) {
    console.log('✅ Cột location đã tồn tại trong bảng payouts\n');
  } else {
    // Thêm cột location
    db.exec('ALTER TABLE payouts ADD COLUMN location TEXT');
    console.log('✅ Đã thêm cột location vào bảng payouts\n');
  }
  
  // Hiển thị cấu trúc bảng sau khi cập nhật
  console.log('📊 Cấu trúc bảng payouts:');
  const columns = db.prepare("PRAGMA table_info(payouts)").all();
  columns.forEach(col => {
    console.log(`  - ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}`);
  });
  
  console.log('\n✅ Hoàn thành! Backend có thể tạo đợt chi trả bây giờ.\n');
  
} catch (error) {
  console.error('❌ Lỗi:', error.message);
} finally {
  db.close();
}
