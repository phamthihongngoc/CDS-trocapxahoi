const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('🧪 TEST DATABASE CONNECTION\n');
console.log('='.repeat(80));
console.log(`📁 Database Path: ${dbPath}\n`);

// Test 1: Kiểm tra kết nối database
console.log('✅ Test 1: Kiểm tra kết nối database');
try {
  const result = db.prepare('SELECT sqlite_version() as version').get();
  console.log(`   ✓ SQLite version: ${result.version}`);
} catch (error) {
  console.error('   ✗ Lỗi kết nối:', error.message);
  process.exit(1);
}

// Test 2: Kiểm tra các bảng trong database
console.log('\n✅ Test 2: Kiểm tra các bảng trong database');
try {
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `).all();
  
  console.log(`   ✓ Tìm thấy ${tables.length} bảng:`);
  tables.forEach(t => console.log(`     - ${t.name}`));
} catch (error) {
  console.error('   ✗ Lỗi:', error.message);
}

// Test 3: Đếm số lượng user theo role
console.log('\n✅ Test 3: Thống kê tài khoản theo vai trò');
try {
  const stats = db.prepare(`
    SELECT role, COUNT(*) as count 
    FROM users 
    GROUP BY role
  `).all();
  
  console.log('   ✓ Thống kê:');
  stats.forEach(s => {
    const icon = s.role === 'CITIZEN' ? '👥' : s.role === 'OFFICER' ? '👨‍💼' : '🔑';
    console.log(`     ${icon} ${s.role}: ${s.count} tài khoản`);
  });
} catch (error) {
  console.error('   ✗ Lỗi:', error.message);
}

// Test 4: Test login với CCCD
console.log('\n✅ Test 4: Test đăng nhập bằng CCCD');
const testCCCD = '001098123456'; // Nguyễn Văn An
const testPassword = '123456';
try {
  const user = db.prepare(`
    SELECT * FROM users 
    WHERE citizen_id = ? AND status = 'active'
  `).get(testCCCD);
  
  if (user) {
    console.log(`   ✓ Tìm thấy user: ${user.full_name}`);
    console.log(`     - CCCD: ${user.citizen_id}`);
    console.log(`     - Email: ${user.email}`);
    console.log(`     - Role: ${user.role}`);
    
    // Test password
    const passwordMatch = bcrypt.compareSync(testPassword, user.password_hash);
    console.log(`     - Password match: ${passwordMatch ? '✓ Đúng' : '✗ Sai'}`);
  } else {
    console.log(`   ✗ Không tìm thấy user với CCCD: ${testCCCD}`);
  }
} catch (error) {
  console.error('   ✗ Lỗi:', error.message);
}

// Test 5: Test login với Email (Officer)
console.log('\n✅ Test 5: Test đăng nhập bằng Email (Officer)');
const testEmail = 'officer1@langson.gov.vn';
try {
  const user = db.prepare(`
    SELECT * FROM users 
    WHERE email = ? AND status = 'active'
  `).get(testEmail);
  
  if (user) {
    console.log(`   ✓ Tìm thấy user: ${user.full_name}`);
    console.log(`     - Email: ${user.email}`);
    console.log(`     - CCCD: ${user.citizen_id}`);
    console.log(`     - Role: ${user.role}`);
    
    // Test password
    const passwordMatch = bcrypt.compareSync(testPassword, user.password_hash);
    console.log(`     - Password match: ${passwordMatch ? '✓ Đúng' : '✗ Sai'}`);
  } else {
    console.log(`   ✗ Không tìm thấy user với email: ${testEmail}`);
  }
} catch (error) {
  console.error('   ✗ Lỗi:', error.message);
}

// Test 6: Test dual login (Email OR CCCD)
console.log('\n✅ Test 6: Test dual login (Email hoặc CCCD)');
const testInput = '025088123456'; // Có thể là email hoặc CCCD
try {
  const user = db.prepare(`
    SELECT * FROM users 
    WHERE (email = ? OR citizen_id = ?) AND status = 'active'
  `).get(testInput, testInput);
  
  if (user) {
    console.log(`   ✓ Tìm thấy user: ${user.full_name}`);
    console.log(`     - Input: ${testInput}`);
    console.log(`     - Match field: ${user.email === testInput ? 'Email' : 'CCCD'}`);
    console.log(`     - Role: ${user.role}`);
  } else {
    console.log(`   ✗ Không tìm thấy user với: ${testInput}`);
  }
} catch (error) {
  console.error('   ✗ Lỗi:', error.message);
}

// Test 7: Kiểm tra các chương trình hỗ trợ
console.log('\n✅ Test 7: Kiểm tra chương trình hỗ trợ');
try {
  const programs = db.prepare(`
    SELECT code, name, status 
    FROM programs 
    ORDER BY code
  `).all();
  
  console.log(`   ✓ Tìm thấy ${programs.length} chương trình:`);
  programs.forEach(p => {
    const statusIcon = p.status === 'active' ? '🟢' : '🔴';
    console.log(`     ${statusIcon} ${p.code}: ${p.name}`);
  });
} catch (error) {
  console.error('   ✗ Lỗi:', error.message);
}

// Test 8: Kiểm tra hồ sơ đã nộp
console.log('\n✅ Test 8: Thống kê hồ sơ đã nộp');
try {
  const appStats = db.prepare(`
    SELECT status, COUNT(*) as count 
    FROM applications 
    GROUP BY status
  `).all();
  
  if (appStats.length > 0) {
    console.log('   ✓ Thống kê hồ sơ:');
    appStats.forEach(s => {
      console.log(`     - ${s.status}: ${s.count} hồ sơ`);
    });
  } else {
    console.log('   ℹ Chưa có hồ sơ nào được nộp');
  }
} catch (error) {
  console.error('   ✗ Lỗi:', error.message);
}

// Test 9: Kiểm tra đơn khiếu nại
console.log('\n✅ Test 9: Thống kê đơn khiếu nại');
try {
  const complaintStats = db.prepare(`
    SELECT status, COUNT(*) as count 
    FROM complaints 
    GROUP BY status
  `).all();
  
  if (complaintStats.length > 0) {
    console.log('   ✓ Thống kê khiếu nại:');
    complaintStats.forEach(s => {
      console.log(`     - ${s.status}: ${s.count} đơn`);
    });
  } else {
    console.log('   ℹ Chưa có đơn khiếu nại nào');
  }
} catch (error) {
  console.error('   ✗ Lỗi:', error.message);
}

// Test 10: Verify CCCD format
console.log('\n✅ Test 10: Kiểm tra định dạng CCCD');
try {
  const invalidCCCD = db.prepare(`
    SELECT full_name, citizen_id 
    FROM users 
    WHERE LENGTH(citizen_id) != 12 OR citizen_id NOT GLOB '[0-9]*'
  `).all();
  
  if (invalidCCCD.length > 0) {
    console.log(`   ⚠ Tìm thấy ${invalidCCCD.length} CCCD không hợp lệ:`);
    invalidCCCD.forEach(u => {
      console.log(`     - ${u.full_name}: ${u.citizen_id} (Length: ${u.citizen_id.length})`);
    });
  } else {
    console.log('   ✓ Tất cả CCCD đều hợp lệ (12 chữ số)');
  }
} catch (error) {
  console.error('   ✗ Lỗi:', error.message);
}

console.log('\n' + '='.repeat(80));
console.log('✅ DATABASE TEST COMPLETED\n');

db.close();
process.exit(0);
