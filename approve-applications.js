import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('📝 Thêm hồ sơ mẫu đã duyệt...\n');

try {
  // Cập nhật hồ sơ hiện tại thành approved
  const updateStmt = db.prepare(`
    UPDATE applications 
    SET status = 'approved', 
        approved_at = datetime('now')
    WHERE status IN ('pending', 'under_review', 'additional_info_required')
    AND (approved_at IS NULL OR approved_at = '')
  `);
  
  const result = updateStmt.run();
  console.log(`✅ Đã cập nhật ${result.changes} hồ sơ thành trạng thái "approved"\n`);

  // Kiểm tra số lượng hồ sơ approved
  const countStmt = db.prepare(`
    SELECT COUNT(*) as total FROM applications WHERE status = 'approved'
  `);
  const count = countStmt.get();
  
  console.log(`📊 Tổng số hồ sơ đã duyệt: ${count.total}\n`);
  
  if (count.total === 0) {
    console.log('⚠️  Không có hồ sơ nào. Vui lòng tạo hồ sơ mới trước.\n');
  } else {
    // Hiển thị danh sách hồ sơ đã duyệt
    const listStmt = db.prepare(`
      SELECT a.code, a.full_name, sp.name as program_name, a.address, a.support_amount
      FROM applications a
      LEFT JOIN support_programs sp ON a.program_id = sp.id
      WHERE a.status = 'approved'
      LIMIT 10
    `);
    
    const apps = listStmt.all();
    console.log('📋 Danh sách hồ sơ đã duyệt:');
    apps.forEach((app, index) => {
      console.log(`  ${index + 1}. ${app.code} - ${app.full_name} - ${app.program_name || 'N/A'}`);
      console.log(`     Địa chỉ: ${app.address}`);
      console.log(`     Số tiền: ${app.support_amount?.toLocaleString('vi-VN')} VNĐ\n`);
    });
  }

  console.log('✅ Hoàn thành! Bây giờ bạn có thể tạo đợt chi trả.\n');
  console.log('💡 Gợi ý:');
  console.log('   - Kỳ chi trả: 01/2025 hoặc Q4/2024');
  console.log('   - Địa bàn: Lạng Sơn (để lấy tất cả hồ sơ)\n');
  
} catch (error) {
  console.error('❌ Lỗi:', error.message);
} finally {
  db.close();
}
