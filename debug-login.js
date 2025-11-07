import { pool } from './server/db.js';
import bcrypt from 'bcryptjs';

console.log('=== DEBUGGING LOGIN ISSUE ===\n');

// Test 1: Check if user exists
console.log('Test 1: Checking if user exists...');
const result = await pool.query('SELECT * FROM users WHERE email = $1', ['citizen1@example.com']);
console.log('Users found:', result.rows.length);

if (result.rows.length > 0) {
  const user = result.rows[0];
  console.log('\nUser data:');
  console.log('- ID:', user.id);
  console.log('- Email:', user.email);
  console.log('- Role:', user.role);
  console.log('- Status:', user.status);
  console.log('- Password hash:', user.password_hash);
  
  // Test 2: Verify password
  console.log('\nTest 2: Verifying password "123456"...');
  const isValid = await bcrypt.compare('123456', user.password_hash);
  console.log('Password valid?', isValid);
  
  if (!isValid) {
    console.log('\n❌ Password verification FAILED!');
    console.log('Generating new hash for password "123456"...');
    const newHash = await bcrypt.hash('123456', 10);
    console.log('New hash:', newHash);
    
    // Update database
    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [newHash, 'citizen1@example.com']);
    console.log('✅ Password hash updated in database');
  } else {
    console.log('\n✅ Password verification SUCCESS!');
  }
} else {
  console.log('\n❌ User not found!');
  console.log('Checking all users in database...');
  const allUsers = await pool.query('SELECT email, role, status FROM users');
  console.log('All users:', allUsers.rows);
}

process.exit(0);
