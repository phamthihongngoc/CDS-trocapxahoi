import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { pool } from './server/db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND status = $2',
      [email, 'active']
    );

    console.log('Query result:', result.rows.length, 'users found');

    if (result.rows.length === 0) {
      console.log('User not found');
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const user = result.rows[0];
    console.log('User found:', user.email, 'role:', user.role);
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid?', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const { password_hash, ...userWithoutPassword } = user;
    console.log('Login successful');
    res.json({ 
      success: true, 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Lỗi đăng nhập' });
  }
});

app.listen(PORT, () => {
  console.log(`Test backend server running on port ${PORT}`);
});
