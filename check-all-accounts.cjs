const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('📊 THỐNG KÊ TÀI KHOẢN TRONG HỆ THỐNG\n');
console.log('='.repeat(80));

// Đếm tổng số tài khoản
const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
console.log(`\n🔢 Tổng số tài khoản: ${totalUsers.count}`);

// Đếm theo vai trò
const roleStats = db.prepare(`
  SELECT role, COUNT(*) as count 
  FROM users 
  GROUP BY role
`).all();

console.log('\n📊 Phân loại theo vai trò:');
roleStats.forEach(stat => {
  const icon = stat.role === 'CITIZEN' ? '👥' : stat.role === 'OFFICER' ? '👨‍💼' : '🔑';
  console.log(`   ${icon} ${stat.role}: ${stat.count} tài khoản`);
});

// Liệt kê tất cả người dân
console.log('\n' + '='.repeat(80));
console.log('👥 DANH SÁCH NGƯỜI DÂN (CITIZEN)\n');
const citizens = db.prepare(`
  SELECT id, full_name, citizen_id, email, phone 
  FROM users 
  WHERE role = 'CITIZEN' 
  ORDER BY id
`).all();

console.log('| ID | Họ và tên           | Số CCCD      | Email                      |');
console.log('|----|---------------------|--------------|----------------------------|');
citizens.forEach(u => {
  console.log(`| ${String(u.id).padEnd(2)} | ${u.full_name.padEnd(19)} | ${u.citizen_id} | ${u.email.padEnd(26)} |`);
});

// Liệt kê cán bộ
console.log('\n' + '='.repeat(80));
console.log('👨‍💼 DANH SÁCH CÁN BỘ (OFFICER)\n');
const officers = db.prepare(`
  SELECT id, full_name, citizen_id, email 
  FROM users 
  WHERE role = 'OFFICER' 
  ORDER BY id
`).all();

console.log('| ID | Họ và tên      | Số CCCD      | Email                     |');
console.log('|----|----------------|--------------|---------------------------|');
officers.forEach(u => {
  console.log(`| ${String(u.id).padEnd(2)} | ${u.full_name.padEnd(14)} | ${u.citizen_id} | ${u.email.padEnd(25)} |`);
});

// Liệt kê admin
console.log('\n' + '='.repeat(80));
console.log('🔑 DANH SÁCH QUẢN TRỊ VIÊN (ADMIN)\n');
const admins = db.prepare(`
  SELECT id, full_name, citizen_id, email 
  FROM users 
  WHERE role = 'ADMIN' 
  ORDER BY id
`).all();

console.log('| ID | Họ và tên      | Số CCCD      | Email                     |');
console.log('|----|----------------|--------------|---------------------------|');
admins.forEach(u => {
  console.log(`| ${String(u.id).padEnd(2)} | ${u.full_name.padEnd(14)} | ${u.citizen_id} | ${u.email.padEnd(25)} |`);
});

// Kiểm tra CCCD format
console.log('\n' + '='.repeat(80));
console.log('✅ KIỂM TRA ĐỊNH DẠNG CCCD\n');
const allUsers = db.prepare('SELECT id, full_name, citizen_id FROM users').all();
let validCount = 0;
let invalidCount = 0;

allUsers.forEach(u => {
  const isValid = /^[0-9]{12}$/.test(u.citizen_id);
  if (isValid) {
    validCount++;
  } else {
    invalidCount++;
    console.log(`❌ ID ${u.id} (${u.full_name}): CCCD không hợp lệ: "${u.citizen_id}"`);
  }
});

console.log(`✅ Số CCCD hợp lệ: ${validCount}/${allUsers.length}`);
if (invalidCount > 0) {
  console.log(`❌ Số CCCD không hợp lệ: ${invalidCount}/${allUsers.length}`);
} else {
  console.log(`🎉 Tất cả số CCCD đều đúng định dạng (12 chữ số)!`);
}

// Test đăng nhập
console.log('\n' + '='.repeat(80));
console.log('🔐 TEST ĐĂNG NHẬP\n');

console.log('Test 1: Đăng nhập bằng CCCD (Người dân)');
const testCitizen = db.prepare(`
  SELECT id, full_name, email, role 
  FROM users 
  WHERE (email = ? OR citizen_id = ?) AND status = 'active'
`).get('001098123456', '001098123456');

if (testCitizen) {
  console.log(`✅ Tìm thấy: ${testCitizen.full_name} (${testCitizen.role})`);
} else {
  console.log('❌ Không tìm thấy tài khoản');
}

console.log('\nTest 2: Đăng nhập bằng Email (Cán bộ)');
const testOfficer = db.prepare(`
  SELECT id, full_name, email, role 
  FROM users 
  WHERE (email = ? OR citizen_id = ?) AND status = 'active'
`).get('officer1@langson.gov.vn', 'officer1@langson.gov.vn');

if (testOfficer) {
  console.log(`✅ Tìm thấy: ${testOfficer.full_name} (${testOfficer.role})`);
} else {
  console.log('❌ Không tìm thấy tài khoản');
}

console.log('\nTest 3: Đăng nhập bằng CCCD (Cán bộ)');
const testOfficerCCCD = db.prepare(`
  SELECT id, full_name, email, role 
  FROM users 
  WHERE (email = ? OR citizen_id = ?) AND status = 'active'
`).get('025088123456', '025088123456');

if (testOfficerCCCD) {
  console.log(`✅ Tìm thấy: ${testOfficerCCCD.full_name} (${testOfficerCCCD.role})`);
} else {
  console.log('❌ Không tìm thấy tài khoản');
}

console.log('\n' + '='.repeat(80));
console.log('✅ KIỂM TRA HOÀN TẤT!\n');

db.close();
