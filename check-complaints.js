import Database from 'better-sqlite3';

const db = new Database('database.sqlite');

console.log('\n=== KIỂM TRA BẢNG COMPLAINTS ===\n');

// Check tables exist
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'complaint%'").all();
console.log('📋 Bảng complaints:');
tables.forEach(t => console.log(`  - ${t.name}`));

if (tables.length === 0) {
  console.log('\n❌ KHÔNG CÓ BẢNG COMPLAINTS NÀO!\n');
  console.log('Cần chạy lại db/schema.sql để tạo bảng.\n');
  db.close();
  process.exit(1);
}

// Check complaint_actions table structure
console.log('\n🔍 Cấu trúc bảng complaint_actions:');
try {
  const cols = db.prepare('PRAGMA table_info(complaint_actions)').all();
  if (cols.length === 0) {
    console.log('  ❌ Bảng complaint_actions KHÔNG TỒN TẠI!');
  } else {
    cols.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
  }
} catch (err) {
  console.log('  ❌ Lỗi:', err.message);
}

// Check complaint_documents table structure
console.log('\n🔍 Cấu trúc bảng complaint_documents:');
try {
  const cols = db.prepare('PRAGMA table_info(complaint_documents)').all();
  if (cols.length === 0) {
    console.log('  ❌ Bảng complaint_documents KHÔNG TỒN TẠI!');
  } else {
    cols.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
  }
} catch (err) {
  console.log('  ❌ Lỗi:', err.message);
}

// Check complaints count
console.log('\n📊 Số lượng complaints:');
try {
  const count = db.prepare('SELECT COUNT(*) as count FROM complaints').get();
  console.log(`  Tổng: ${count.count} đơn khiếu nại`);
} catch (err) {
  console.log('  ❌ Lỗi:', err.message);
}

db.close();
console.log('\n✅ Hoàn tất kiểm tra!\n');
