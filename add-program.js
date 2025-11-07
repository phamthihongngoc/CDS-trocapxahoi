import Database from 'better-sqlite3';

const db = new Database('./database.sqlite');

try {
  // Thêm chương trình "Trợ cấp người cao tuổi"
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO support_programs 
    (code, name, description, type, amount, start_date, end_date, status, created_by) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    'TC005',
    'Trợ cấp người cao tuổi',
    'Hỗ trợ hàng tháng cho người cao tuổi từ 80 tuổi trở lên',
    'Người cao tuổi',
    500000,
    '2024-01-01',
    '2024-12-31',
    'active',
    1
  );

  console.log('✅ Đã thêm chương trình "Trợ cấp người cao tuổi"');
  console.log('Changes:', result.changes);

  // Hiển thị tất cả chương trình
  const programs = db.prepare('SELECT * FROM support_programs ORDER BY id').all();
  console.log('\n📋 Danh sách chương trình hỗ trợ:');
  programs.forEach(p => {
    console.log(`  - ${p.code}: ${p.name} (${p.amount.toLocaleString('vi-VN')} đ/tháng)`);
  });

  db.close();
} catch (error) {
  console.error('❌ Lỗi:', error.message);
  db.close();
  process.exit(1);
}
