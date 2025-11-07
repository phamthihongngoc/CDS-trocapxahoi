import Database from 'better-sqlite3';

const db = new Database('database.sqlite');

console.log('\n=== KIỂM TRA USERS ===\n');

// Count users
const countResult = db.prepare('SELECT COUNT(*) as count FROM users').get();
console.log(`📊 Tổng số users: ${countResult.count}\n`);

if (countResult.count === 0) {
  console.log('❌ KHÔNG CÓ USER NÀO TRONG DATABASE!\n');
  console.log('Cần chạy lại script seed-data.js để tạo dữ liệu.\n');
  db.close();
  process.exit(1);
}

// Get sample users
console.log('👤 Một số users mẫu:\n');
const users = db.prepare('SELECT id, full_name, email, citizen_id, role, status FROM users LIMIT 5').all();
users.forEach(user => {
  console.log(`  - ID: ${user.id}`);
  console.log(`    Tên: ${user.full_name}`);
  console.log(`    Email: ${user.email}`);
  console.log(`    CCCD: ${user.citizen_id}`);
  console.log(`    Role: ${user.role}`);
  console.log(`    Status: ${user.status}`);
  console.log('');
});

// Check password hash
console.log('🔐 Kiểm tra password hash:\n');
const userWithPwd = db.prepare('SELECT id, full_name, password_hash FROM users LIMIT 1').get();
if (userWithPwd.password_hash) {
  console.log(`  ✅ User "${userWithPwd.full_name}" có password hash`);
  console.log(`     Hash: ${userWithPwd.password_hash.substring(0, 30)}...`);
} else {
  console.log(`  ❌ User "${userWithPwd.full_name}" KHÔNG có password hash!`);
}

// Check admin account
console.log('\n👨‍💼 Tài khoản admin:\n');
const admin = db.prepare('SELECT * FROM users WHERE role = ?').get('ADMIN');
if (admin) {
  console.log(`  ✅ Tìm thấy admin: ${admin.full_name}`);
  console.log(`     Email: ${admin.email}`);
  console.log(`     CCCD: ${admin.citizen_id}`);
  console.log(`     Status: ${admin.status}`);
} else {
  console.log('  ❌ KHÔNG tìm thấy tài khoản admin!');
}

// Check officer accounts
console.log('\n👨‍💼 Tài khoản cán bộ:\n');
const officers = db.prepare('SELECT full_name, email, citizen_id, status FROM users WHERE role = ?').all('OFFICER');
console.log(`  Tổng số: ${officers.length} cán bộ`);
officers.forEach(officer => {
  console.log(`  - ${officer.full_name} (${officer.email}) - ${officer.status}`);
});

// Check citizen accounts
console.log('\n👥 Tài khoản người dân:\n');
const citizenCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('CITIZEN');
console.log(`  Tổng số: ${citizenCount.count} người dân`);

db.close();
console.log('\n✅ Hoàn tất kiểm tra!\n');
