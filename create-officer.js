import { pool } from './server/db.js';
import bcrypt from 'bcryptjs';

console.log('Creating officer1@langson.gov.vn...');

const passwordHash = await bcrypt.hash('123456', 10);

await pool.query(
  'INSERT INTO users (full_name, email, phone, address, password_hash, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
  ['Cán bộ Trần Thị C', 'officer1@langson.gov.vn', '0912345679', 'UBND Xã Hoàng Đồng', passwordHash, 'OFFICER', 'active']
);

console.log('✅ Created successfully!');
console.log('Email: officer1@langson.gov.vn');
console.log('Password: 123456');
console.log('Role: OFFICER');

process.exit(0);
