import { pool } from './server/db.js';
import bcrypt from 'bcryptjs';

console.log('=== KIỂM TRA TÀI KHOẢN OFFICER & ADMIN ===\n');

// Kiểm tra officer@langson.gov.vn
console.log('1. Kiểm tra officer@langson.gov.vn...');
const officerResult = await pool.query('SELECT * FROM users WHERE email = $1', ['officer@langson.gov.vn']);
console.log('   Số lượng tìm thấy:', officerResult.rows.length);

if (officerResult.rows.length > 0) {
  const officer = officerResult.rows[0];
  console.log('   ✓ User tồn tại:');
  console.log('     - ID:', officer.id);
  console.log('     - Email:', officer.email);
  console.log('     - Role:', officer.role);
  console.log('     - Status:', officer.status);
  console.log('     - Password hash:', officer.password_hash.substring(0, 30) + '...');
  
  // Test password
  const isValid = await bcrypt.compare('123456', officer.password_hash);
  console.log('     - Password "123456" valid?', isValid);
} else {
  console.log('   ✗ KHÔNG TÌM THẤY!');
}

console.log('\n2. Kiểm tra admin@langson.gov.vn...');
const adminResult = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@langson.gov.vn']);
console.log('   Số lượng tìm thấy:', adminResult.rows.length);

if (adminResult.rows.length > 0) {
  const admin = adminResult.rows[0];
  console.log('   ✓ User tồn tại:');
  console.log('     - ID:', admin.id);
  console.log('     - Email:', admin.email);
  console.log('     - Role:', admin.role);
  console.log('     - Status:', admin.status);
  console.log('     - Password hash:', admin.password_hash.substring(0, 30) + '...');
  
  // Test password
  const isValid = await bcrypt.compare('123456', admin.password_hash);
  console.log('     - Password "123456" valid?', isValid);
} else {
  console.log('   ✗ KHÔNG TÌM THẤY!');
}

console.log('\n3. Danh sách tất cả users:');
const allUsers = await pool.query('SELECT id, email, role, status FROM users ORDER BY id');
console.log(allUsers.rows);

process.exit(0);
