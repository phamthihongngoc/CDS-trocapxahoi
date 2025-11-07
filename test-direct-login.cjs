const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('🧪 TEST ĐĂNG NHẬP TRỰC TIẾP VÀO DATABASE\n');
console.log('='.repeat(80));

const testCases = [
  { input: '025088123456', desc: 'CCCD cán bộ (025088123456)' },
  { input: 'officer1@langson.gov.vn', desc: 'Email cán bộ' },
  { input: '001098123456', desc: 'CCCD người dân (001098123456)' },
  { input: 'admin@langson.gov.vn', desc: 'Email admin' },
];

const password = '123456';

for (const test of testCases) {
  console.log(`\n📝 Test: ${test.desc}`);
  console.log(`   Input: ${test.input}`);

  try {
    const user = db.prepare(`
      SELECT * FROM users 
      WHERE (email = ? OR citizen_id = ?) AND status = ?
    `).get(test.input, test.input, 'active');

    if (!user) {
      console.log(`   ❌ Không tìm thấy user`);
      continue;
    }

    console.log(`   ✅ Tìm thấy: ${user.full_name} (${user.role})`);
    console.log(`      ID: ${user.id}`);
    console.log(`      Email: ${user.email}`);
    console.log(`      CCCD: ${user.citizen_id}`);

    // Verify password
    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    if (isValidPassword) {
      console.log(`   ✅ Password đúng!`);
    } else {
      console.log(`   ❌ Password sai!`);
    }
  } catch (error) {
    console.log(`   ❌ Lỗi: ${error.message}`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('✅ TEST HOÀN TẤT!\n');

db.close();
