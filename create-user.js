import { pool } from './server/db.js';
import bcrypt from 'bcryptjs';

console.log('Creating new user: citizen1@example.com...');

const passwordHash = await bcrypt.hash('123456', 10);

await pool.query(
  'INSERT INTO users (full_name, email, phone, address, password_hash, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
  ['Nguyễn Văn Ba', 'citizen1@example.com', '0123456790', 'Lạng Sơn', passwordHash, 'CITIZEN', 'active']
);

console.log('✅ User created successfully!');
console.log('Email: citizen1@example.com');
console.log('Password: 123456');

process.exit(0);
