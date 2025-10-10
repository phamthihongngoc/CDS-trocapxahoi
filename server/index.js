import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { requireAuth, requireRole, requireOfficerOrAdmin, requireAdmin } from './middleware/auth.js';
import { pool } from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, phone, address, password } = req.body;

    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (full_name, email, phone, address, password_hash, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, full_name, email, phone, address, role, status, created_at',
      [fullName, email, phone, address, passwordHash, 'CITIZEN', 'active']
    );

    res.json({ 
      success: true, 
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Lỗi đăng ký' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND status = $2',
      [email, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ 
      success: true, 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Lỗi đăng nhập' });
  }
});

app.get('/api/programs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM support_programs WHERE status = $1 ORDER BY created_at DESC',
      ['active']
    );
    res.json({ success: true, programs: result.rows });
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách chương trình' });
  }
});

app.get('/api/programs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM support_programs WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy chương trình' });
    }
    
    res.json({ success: true, program: result.rows[0] });
  } catch (error) {
    console.error('Get program error:', error);
    res.status(500).json({ error: 'Lỗi lấy thông tin chương trình' });
  }
});

app.post('/api/programs', requireOfficerOrAdmin, async (req, res) => {
  try {
    const { code, name, description, type, amount, start_date, end_date } = req.body;
    const userId = req.userId;

    const result = await pool.query(
      'INSERT INTO support_programs (code, name, description, type, amount, start_date, end_date, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [code, name, description, type, amount, start_date, end_date, userId]
    );

    res.json({ success: true, program: result.rows[0] });
  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({ error: 'Lỗi tạo chương trình' });
  }
});

app.put('/api/programs/:id', requireOfficerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, type, amount, start_date, end_date, status } = req.body;

    const result = await pool.query(
      'UPDATE support_programs SET code = $1, name = $2, description = $3, type = $4, amount = $5, start_date = $6, end_date = $7, status = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *',
      [code, name, description, type, amount, start_date, end_date, status || 'active', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy chương trình' });
    }

    res.json({ success: true, program: result.rows[0] });
  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật chương trình' });
  }
});

app.delete('/api/programs/:id', requireOfficerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE support_programs SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['inactive', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy chương trình' });
    }

    res.json({ success: true, message: 'Đã xóa chương trình thành công' });
  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({ error: 'Lỗi xóa chương trình' });
  }
});

app.get('/api/applications/my', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let conditions = ['a.user_id = $1'];
    let params = [userId];
    let paramCount = 1;
    
    if (status && status !== 'all') {
      paramCount++;
      conditions.push(`a.status = $${paramCount}`);
      params.push(status);
    }
    
    if (search) {
      paramCount++;
      const searchParam1 = paramCount;
      paramCount++;
      const searchParam2 = paramCount;
      paramCount++;
      const searchParam3 = paramCount;
      conditions.push(`(LOWER(a.code) LIKE LOWER($${searchParam1}) OR LOWER(a.full_name) LIKE LOWER($${searchParam2}) OR LOWER(p.name) LIKE LOWER($${searchParam3}))`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    const whereClause = conditions.join(' AND ');
    
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM applications a 
       LEFT JOIN support_programs p ON a.program_id = p.id 
       WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(
      `SELECT a.*, p.name as program_name, p.type as program_type 
       FROM applications a 
       LEFT JOIN support_programs p ON a.program_id = p.id 
       WHERE ${whereClause}
       ORDER BY a.submitted_at DESC, a.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      params
    );
    
    res.json({ 
      success: true, 
      applications: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách hồ sơ' });
  }
});

app.get('/api/applications', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    
    let query;
    let params;
    
    if (userRole === 'CITIZEN') {
      query = 'SELECT a.*, p.name as program_name FROM applications a LEFT JOIN support_programs p ON a.program_id = p.id WHERE a.user_id = $1 ORDER BY a.created_at DESC';
      params = [userId];
    } else {
      query = 'SELECT a.*, p.name as program_name, u.full_name as user_name FROM applications a LEFT JOIN support_programs p ON a.program_id = p.id LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC';
      params = [];
    }
    
    const result = await pool.query(query, params);
    res.json({ success: true, applications: result.rows });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách hồ sơ' });
  }
});

app.get('/api/applications/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;
    
    const result = await pool.query(
      'SELECT a.*, p.name as program_name, p.type as program_type FROM applications a LEFT JOIN support_programs p ON a.program_id = p.id WHERE a.id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
    }
    
    const application = result.rows[0];
    
    if (userRole === 'CITIZEN' && application.user_id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Bạn không có quyền xem hồ sơ này' });
    }
    
    const historyResult = await pool.query(
      `SELECT h.*, u.full_name as performed_by_name, u.role as performed_by_role 
       FROM application_history h 
       LEFT JOIN users u ON h.performed_by = u.id 
       WHERE h.application_id = $1 
       ORDER BY h.created_at ASC`,
      [id]
    );
    
    res.json({ 
      success: true, 
      application,
      history: historyResult.rows
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'Lỗi lấy thông tin hồ sơ' });
  }
});

app.post('/api/applications', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const {
      program_id, citizen_id, full_name, date_of_birth, gender,
      phone, email, address, district, commune, village,
      application_type, support_amount, household_size, monthly_income,
      housing_condition, household_members, household_members_data, notes
    } = req.body;

    const codeResult = await pool.query(
      "SELECT code FROM applications ORDER BY id DESC LIMIT 1"
    );
    
    let newCode = 'APP00001';
    if (codeResult.rows.length > 0) {
      const lastCode = codeResult.rows[0].code;
      const lastNumber = parseInt(lastCode.replace('APP', ''));
      newCode = `APP${String(lastNumber + 1).padStart(5, '0')}`;
    }
    const code = newCode;

    const householdData = household_members || household_members_data || null;
    
    const normalizedMonthlyIncome = monthly_income && monthly_income !== '' ? monthly_income : null;
    const normalizedSupportAmount = support_amount && support_amount !== '' ? support_amount : null;
    const normalizedHouseholdSize = household_size && household_size !== '' ? household_size : null;

    const result = await pool.query(
      `INSERT INTO applications (
        code, user_id, program_id, citizen_id, full_name, date_of_birth, gender,
        phone, email, address, district, commune, village, application_type,
        support_amount, household_members_data, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        code, userId, program_id, citizen_id, full_name, date_of_birth, gender,
        phone, email, address, district, commune, village, application_type,
        normalizedSupportAmount, householdData, notes, 'pending'
      ]
    );

    await pool.query(
      'INSERT INTO application_history (application_id, action, new_status, performed_by) VALUES ($1, $2, $3, $4)',
      [result.rows[0].id, 'Tạo hồ sơ', 'pending', userId]
    );

    res.json({ success: true, application: result.rows[0] });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ error: 'Lỗi tạo hồ sơ' });
  }
});

app.put('/api/applications/:id/status', requireOfficerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason, notes } = req.body;
    const userId = req.userId;

    const oldApp = await pool.query('SELECT status FROM applications WHERE id = $1', [id]);
    const oldStatus = oldApp.rows[0]?.status;

    const timestampField = status === 'approved' ? 'approved_at' : status === 'rejected' ? 'rejected_at' : 'reviewed_at';
    
    const result = await pool.query(
      `UPDATE applications SET status = $1, rejection_reason = $2, notes = $3, ${timestampField} = CURRENT_TIMESTAMP, assigned_officer_id = $4 WHERE id = $5 RETURNING *`,
      [status, rejection_reason, notes, userId, id]
    );

    await pool.query(
      'INSERT INTO application_history (application_id, action, old_status, new_status, comment, performed_by) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, `Cập nhật trạng thái`, oldStatus, status, notes || rejection_reason, userId]
    );

    res.json({ success: true, application: result.rows[0] });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật trạng thái hồ sơ' });
  }
});

app.get('/api/dashboard/stats', requireOfficerOrAdmin, async (req, res) => {
  try {
    const totalApps = await pool.query('SELECT COUNT(*) as count FROM applications');
    const pendingApps = await pool.query("SELECT COUNT(*) as count FROM applications WHERE status = 'pending'");
    const approvedApps = await pool.query("SELECT COUNT(*) as count FROM applications WHERE status = 'approved'");
    const rejectedApps = await pool.query("SELECT COUNT(*) as count FROM applications WHERE status = 'rejected'");
    const paidApps = await pool.query("SELECT COUNT(*) as count FROM payouts WHERE status = 'completed'");
    const totalAmount = await pool.query("SELECT COALESCE(SUM(support_amount), 0) as total FROM applications WHERE status = 'approved'");
    const totalComplaints = await pool.query('SELECT COUNT(*) as count FROM complaints');

    res.json({
      success: true,
      stats: {
        totalApplications: parseInt(totalApps.rows[0].count),
        pendingApplications: parseInt(pendingApps.rows[0].count),
        approvedApplications: parseInt(approvedApps.rows[0].count),
        rejectedApplications: parseInt(rejectedApps.rows[0].count),
        paidApplications: parseInt(paidApps.rows[0].count),
        totalAmount: parseFloat(totalAmount.rows[0].total),
        totalComplaints: parseInt(totalComplaints.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Lỗi lấy thống kê' });
  }
});

app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { is_read } = req.query;
    
    let query = 'SELECT * FROM notifications WHERE user_id = $1';
    const params = [userId];
    
    if (is_read !== undefined) {
      query += ' AND is_read = $2';
      params.push(is_read === 'true');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    const unreadCount = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    
    res.json({ 
      success: true, 
      notifications: result.rows,
      unreadCount: parseInt(unreadCount.rows[0].count)
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Lỗi lấy thông báo' });
  }
});

app.post('/api/notifications/:id/mark-read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy thông báo' });
    }
    
    res.json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật thông báo' });
  }
});

app.post('/api/notifications/mark-all-read', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    
    res.json({ success: true, message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật thông báo' });
  }
});

app.get('/api/users', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, phone, address, role, status, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách người dùng' });
  }
});

app.put('/api/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, full_name, email, role',
      [role, id]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật vai trò người dùng' });
  }
});

// Officer Applications Management APIs
app.get('/api/officer/applications', requireOfficerOrAdmin, async (req, res) => {
  try {
    const { status, program, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT 
        a.id, 
        a.code, 
        a.full_name, 
        a.citizen_id, 
        a.status, 
        a.created_at,
        sp.name as program_name
      FROM applications a
      LEFT JOIN support_programs sp ON a.program_id = sp.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;
    
    if (status) {
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    if (program) {
      query += ` AND a.program_id = $${paramCount}`;
      params.push(program);
      paramCount++;
    }
    
    if (search) {
      query += ` AND (LOWER(a.full_name) LIKE LOWER($${paramCount}) OR LOWER(a.citizen_id) LIKE LOWER($${paramCount + 1}) OR LOWER(a.code) LIKE LOWER($${paramCount + 2}))`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      paramCount += 3;
    }
    
    query += ` ORDER BY a.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM applications a WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;
    
    if (status) {
      countQuery += ` AND a.status = $${countParamCount}`;
      countParams.push(status);
      countParamCount++;
    }
    
    if (program) {
      countQuery += ` AND a.program_id = $${countParamCount}`;
      countParams.push(program);
      countParamCount++;
    }
    
    if (search) {
      countQuery += ` AND (LOWER(a.full_name) LIKE LOWER($${countParamCount}) OR LOWER(a.citizen_id) LIKE LOWER($${countParamCount + 1}) OR LOWER(a.code) LIKE LOWER($${countParamCount + 2}))`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      success: true,
      applications: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get officer applications error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách hồ sơ' });
  }
});

app.get('/api/officer/applications/stats', requireOfficerOrAdmin, async (req, res) => {
  try {
    const totalApps = await pool.query("SELECT COUNT(*) as count FROM applications");
    const pendingApps = await pool.query("SELECT COUNT(*) as count FROM applications WHERE status IN ('pending', 'under_review')");
    const approvedApps = await pool.query("SELECT COUNT(*) as count FROM applications WHERE status = 'approved'");
    const paidApps = await pool.query("SELECT COUNT(*) as count FROM applications WHERE status = 'paid'");

    res.json({
      success: true,
      stats: {
        total: parseInt(totalApps.rows[0].count),
        pending: parseInt(pendingApps.rows[0].count),
        approved: parseInt(approvedApps.rows[0].count),
        paid: parseInt(paidApps.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get officer application stats error:', error);
    res.status(500).json({ error: 'Lỗi lấy thống kê hồ sơ' });
  }
});

// Officer creates application for citizen
app.post('/api/officer/applications', requireOfficerOrAdmin, async (req, res) => {
  try {
    const {
      citizen_id,
      full_name,
      date_of_birth,
      gender,
      phone,
      email,
      address,
      district,
      commune,
      village,
      household_size,
      monthly_income,
      housing_condition,
      household_members_data,
      program_id,
      support_amount,
      notes
    } = req.body;
    
    const officerId = req.userId;

    // Generate application code
    const codeResult = await pool.query(
      "SELECT code FROM applications ORDER BY id DESC LIMIT 1"
    );
    
    let newCode = 'APP00001';
    if (codeResult.rows.length > 0) {
      const lastCode = codeResult.rows[0].code;
      const num = parseInt(lastCode.replace('APP', '')) + 1;
      newCode = 'APP' + String(num).padStart(5, '0');
    }

    // Insert application - created by officer, status is under_review
    const result = await pool.query(
      `INSERT INTO applications (
        code, citizen_id, full_name, date_of_birth, gender, phone, email,
        address, district, commune, village, household_members_data, program_id, support_amount,
        notes, status, assigned_officer_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        newCode, citizen_id, full_name, date_of_birth, gender, phone, email,
        address, district, commune, village, JSON.stringify(household_members_data || []), program_id, support_amount || null,
        notes, 'under_review', officerId
      ]
    );

    // Create activity log
    await pool.query(
      'INSERT INTO application_history (application_id, action, performed_by, comment) VALUES ($1, $2, $3, $4)',
      [result.rows[0].id, 'created', officerId, 'Hồ sơ được tạo bởi cán bộ']
    );

    res.json({
      success: true,
      application: result.rows[0],
      message: 'Tạo hồ sơ thành công'
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ error: 'Lỗi tạo hồ sơ' });
  }
});

// ============= PAYOUT MANAGEMENT APIs =============

// Get payout stats
app.get('/api/payouts/stats', requireOfficerOrAdmin, async (req, res) => {
  try {
    const pendingResult = await pool.query(
      "SELECT COUNT(*) as count FROM payouts WHERE status = 'pending'"
    );
    const paidResult = await pool.query(
      "SELECT COUNT(*) as count FROM payouts WHERE status = 'completed'"
    );
    const processingResult = await pool.query(
      "SELECT COUNT(*) as count FROM payouts WHERE status = 'processing'"
    );
    const totalResult = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM payouts WHERE status = 'completed'"
    );

    res.json({
      success: true,
      stats: {
        pending: parseInt(pendingResult.rows[0].count),
        paid: parseInt(paidResult.rows[0].count),
        processing: parseInt(processingResult.rows[0].count),
        total_amount: parseFloat(totalResult.rows[0].total)
      }
    });
  } catch (error) {
    console.error('Get payout stats error:', error);
    res.status(500).json({ error: 'Lỗi lấy thống kê chi trả' });
  }
});

// Get payout batches
app.get('/api/payouts/batches', requireOfficerOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM payouts ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      batches: result.rows.map(row => ({
        id: row.id,
        batch_code: row.batch_code,
        period: row.period || '-',
        location: row.location || '-',
        total_recipients: parseInt(row.total_recipients) || 0,
        total_amount: parseFloat(row.total_amount) || 0,
        status: row.status,
        created_at: row.created_at
      }))
    });
  } catch (error) {
    console.error('Get payout batches error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách đợt chi trả' });
  }
});

// Create payout batch
app.post('/api/payouts/batches', requireOfficerOrAdmin, async (req, res) => {
  try {
    const { period, location, program_id } = req.body;
    const officerId = req.userId;

    // Generate batch code
    const codeResult = await pool.query(
      "SELECT batch_code FROM payouts ORDER BY id DESC LIMIT 1"
    );
    
    let newCode = 'BATCH001';
    if (codeResult.rows.length > 0) {
      const lastCode = codeResult.rows[0].batch_code;
      const num = parseInt(lastCode.replace('BATCH', '')) + 1;
      newCode = 'BATCH' + String(num).padStart(3, '0');
    }

    // Find approved applications for this batch
    let query = `
      SELECT id, support_amount, full_name, citizen_id 
      FROM applications 
      WHERE status = 'approved' 
      AND id NOT IN (SELECT application_id FROM payout_items WHERE application_id IS NOT NULL)
    `;
    const params = [];
    let paramCount = 0;
    
    if (program_id) {
      paramCount++;
      query += ` AND program_id = $${paramCount}`;
      params.push(program_id);
    }

    // Filter by location if provided (match against district, commune, or village)
    if (location && location.trim() !== '') {
      paramCount++;
      query += ` AND (LOWER(district) LIKE LOWER($${paramCount}) OR LOWER(commune) LIKE LOWER($${paramCount + 1}) OR LOWER(village) LIKE LOWER($${paramCount + 2}) OR LOWER(address) LIKE LOWER($${paramCount + 3}))`;
      params.push(`%${location}%`, `%${location}%`, `%${location}%`, `%${location}%`);
      paramCount += 3;
    }

    const appsResult = await pool.query(query, params);

    const totalAmount = appsResult.rows.reduce((sum, app) => sum + (parseFloat(app.support_amount) || 0), 0);
    const totalRecipients = appsResult.rows.length;

    // Create batch in payouts table
    const batchResult = await pool.query(
      `INSERT INTO payouts (batch_code, period, location, total_amount, total_recipients, status, created_by, program_id)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7) RETURNING *`,
      [newCode, period, location, totalAmount, totalRecipients, officerId, program_id || null]
    );

    const payoutId = batchResult.rows[0].id;

    // Create individual payout items
    for (const app of appsResult.rows) {
      await pool.query(
        `INSERT INTO payout_items (payout_id, application_id, amount, status, beneficiary_name, citizen_id)
         VALUES ($1, $2, $3, 'pending', $4, $5)`,
        [payoutId, app.id, app.support_amount || 0, app.full_name, app.citizen_id]
      );
    }

    res.json({
      success: true,
      batch: batchResult.rows[0],
      message: `Tạo đợt chi trả thành công với ${appsResult.rows.length} hồ sơ`
    });
  } catch (error) {
    console.error('Create payout batch error:', error);
    res.status(500).json({ error: 'Lỗi tạo đợt chi trả' });
  }
});

// Get payout details
app.get('/api/payouts/details', requireOfficerOrAdmin, async (req, res) => {
  try {
    const { batch_id } = req.query;
    
    let query = 'SELECT * FROM payout_items ORDER BY created_at DESC';
    const params = [];
    
    if (batch_id) {
      query = 'SELECT * FROM payout_items WHERE payout_id = $1 ORDER BY created_at DESC';
      params.push(batch_id);
    }

    const result = await pool.query(query, params);

    res.json({
      success: true,
      details: result.rows.map(row => ({
        id: row.id,
        batch_id: row.payout_id,
        application_id: row.application_id,
        citizen_name: row.beneficiary_name,
        citizen_id: row.citizen_id,
        amount: parseFloat(row.amount),
        status: row.status,
        payment_date: row.paid_at
      }))
    });
  } catch (error) {
    console.error('Get payout details error:', error);
    res.status(500).json({ error: 'Lỗi lấy chi tiết thanh toán' });
  }
});

// Update batch status
app.put('/api/payouts/batches/:id/status', requireOfficerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query(
      'UPDATE payouts SET status = $1, disbursed_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
    );

    // Update all payout items in this batch
    await pool.query(
      'UPDATE payout_items SET status = $1, paid_at = CURRENT_TIMESTAMP WHERE payout_id = $2',
      [status, id]
    );

    // Update application status to 'paid' if batch is completed
    if (status === 'completed') {
      await pool.query(`
        UPDATE applications 
        SET status = 'paid' 
        WHERE id IN (
          SELECT application_id FROM payout_items WHERE payout_id = $1 AND application_id IS NOT NULL
        )
      `, [id]);
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công'
    });
  } catch (error) {
    console.error('Update batch status error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật trạng thái' });
  }
});

// Import payout results
app.post('/api/payouts/import', requireOfficerOrAdmin, async (req, res) => {
  try {
    const { updates } = req.body;

    for (const update of updates) {
      const { batch_code, status } = update;
      await pool.query(
        'UPDATE payouts SET status = $1 WHERE batch_code = $2',
        [status, batch_code]
      );
    }

    res.json({
      success: true,
      message: 'Import thành công'
    });
  } catch (error) {
    console.error('Import payout error:', error);
    res.status(500).json({ error: 'Lỗi import dữ liệu' });
  }
});

// ============= COMPLAINTS MANAGEMENT APIs =============

// Get complaint stats
app.get('/api/complaints/stats', requireOfficerOrAdmin, async (req, res) => {
  try {
    const totalResult = await pool.query("SELECT COUNT(*) as count FROM complaints");
    const inProgressResult = await pool.query(
      "SELECT COUNT(*) as count FROM complaints WHERE status = 'in_progress'"
    );
    const resolvedResult = await pool.query(
      "SELECT COUNT(*) as count FROM complaints WHERE status = 'resolved'"
    );

    res.json({
      success: true,
      stats: {
        total: parseInt(totalResult.rows[0].count),
        pending: parseInt(inProgressResult.rows[0].count),
        resolved: parseInt(resolvedResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get complaint stats error:', error);
    res.status(500).json({ error: 'Lỗi lấy thống kê khiếu nại' });
  }
});

// Get complaints list
app.get('/api/complaints', requireOfficerOrAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT 
        c.*,
        u.full_name as citizen_name,
        o.full_name as assigned_officer_name
      FROM complaints c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users o ON c.assigned_to = o.id
      ORDER BY c.created_at DESC
    `;
    
    const params = [];
    
    if (status) {
      query = `
        SELECT 
          c.*,
          u.full_name as citizen_name,
          o.full_name as assigned_officer_name
        FROM complaints c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN users o ON c.assigned_to = o.id
        WHERE c.status = $1
        ORDER BY c.created_at DESC
      `;
      params.push(status);
    }

    const result = await pool.query(query, params);

    res.json({
      success: true,
      complaints: result.rows.map(row => ({
        id: row.id,
        code: row.code,
        citizen_name: row.citizen_name,
        subject: row.title,
        description: row.description,
        status: row.status,
        created_at: row.created_at,
        assigned_officer_id: row.assigned_to,
        assigned_officer_name: row.assigned_officer_name
      }))
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách khiếu nại' });
  }
});

// Assign complaint to officer
app.put('/api/complaints/:id/assign', requireOfficerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { officer_id } = req.body;

    await pool.query(
      `UPDATE complaints 
       SET assigned_to = $1, status = 'in_progress', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [officer_id, id]
    );

    res.json({
      success: true,
      message: 'Phân công xử lý thành công'
    });
  } catch (error) {
    console.error('Assign complaint error:', error);
    res.status(500).json({ error: 'Lỗi phân công xử lý' });
  }
});

// Respond to complaint
app.post('/api/complaints/:id/respond', requireOfficerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const officerId = req.userId;

    await pool.query(
      `UPDATE complaints 
       SET resolution = $1, status = 'resolved', resolved_at = CURRENT_TIMESTAMP, 
           assigned_to = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [response, officerId, id]
    );

    res.json({
      success: true,
      message: 'Phản hồi khiếu nại thành công'
    });
  } catch (error) {
    console.error('Respond to complaint error:', error);
    res.status(500).json({ error: 'Lỗi phản hồi khiếu nại' });
  }
});

// Get list of officers for assignment
app.get('/api/users/officers', requireOfficerOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, email FROM users WHERE role IN ('OFFICER', 'ADMIN') ORDER BY full_name"
    );

    res.json({
      success: true,
      officers: result.rows
    });
  } catch (error) {
    console.error('Get officers error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách cán bộ' });
  }
});

// ============= REPORTS & STATISTICS APIs =============

// Get report statistics
app.get('/api/reports/stats', requireOfficerOrAdmin, async (req, res) => {
  try {
    const { year, view } = req.query;
    const currentYear = year || new Date().getFullYear();

    // Total applications
    const totalResult = await pool.query(
      "SELECT COUNT(*) as count FROM applications WHERE EXTRACT(YEAR FROM created_at) = $1",
      [currentYear]
    );

    // Approval rate
    const approvedResult = await pool.query(
      "SELECT COUNT(*) as count FROM applications WHERE status = 'approved' AND EXTRACT(YEAR FROM created_at) = $1",
      [currentYear]
    );
    const totalApps = parseInt(totalResult.rows[0].count);
    const approvedApps = parseInt(approvedResult.rows[0].count);
    const approvalRate = totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0;

    // Paid applications
    const paidResult = await pool.query(
      "SELECT COUNT(*) as count FROM applications WHERE status = 'paid' AND EXTRACT(YEAR FROM created_at) = $1",
      [currentYear]
    );

    // Total paid amount
    const totalPaidResult = await pool.query(
      `SELECT COALESCE(SUM(a.support_amount), 0) as total 
       FROM applications a 
       WHERE a.status = 'paid' AND EXTRACT(YEAR FROM a.created_at) = $1`,
      [currentYear]
    );

    // Status distribution
    const statusResult = await pool.query(
      `SELECT 
        status,
        COUNT(*) as count
       FROM applications
       WHERE EXTRACT(YEAR FROM created_at) = $1
       GROUP BY status`,
      [currentYear]
    );

    const statusColors = {
      pending: '#fbbf24',
      under_review: '#60a5fa',
      approved: '#34d399',
      rejected: '#f87171',
      paid: '#a78bfa'
    };

    const statusNames = {
      pending: 'Chờ xử lý',
      under_review: 'Đang xem xét',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
      paid: 'Đã chi trả'
    };

    const statusDistribution = statusResult.rows.map(row => ({
      name: statusNames[row.status] || row.status,
      value: parseInt(row.count),
      color: statusColors[row.status] || '#9ca3af'
    }));

    // Program distribution
    const programResult = await pool.query(
      `SELECT 
        sp.name,
        COUNT(a.id) as applications,
        COALESCE(SUM(a.support_amount), 0) as amount
       FROM support_programs sp
       LEFT JOIN applications a ON a.program_id = sp.id 
         AND EXTRACT(YEAR FROM a.created_at) = $1
       GROUP BY sp.id, sp.name
       ORDER BY applications DESC
       LIMIT 10`,
      [currentYear]
    );

    const programDistribution = programResult.rows.map(row => ({
      name: row.name,
      applications: parseInt(row.applications),
      amount: parseFloat(row.amount)
    }));

    // Monthly trend (if view is monthly)
    let monthlyTrend = [];
    if (view === 'monthly') {
      const monthlyResult = await pool.query(
        `SELECT 
          TO_CHAR(created_at, 'MM') as month,
          COUNT(*) as applications,
          COALESCE(SUM(support_amount), 0) as amount
         FROM applications
         WHERE EXTRACT(YEAR FROM created_at) = $1
         GROUP BY TO_CHAR(created_at, 'MM')
         ORDER BY month`,
        [currentYear]
      );

      monthlyTrend = monthlyResult.rows.map(row => ({
        month: `T${row.month}`,
        applications: parseInt(row.applications),
        amount: parseFloat(row.amount)
      }));
    }

    res.json({
      success: true,
      stats: {
        totalApplications: totalApps,
        approvalRate: approvalRate,
        paidApplications: parseInt(paidResult.rows[0].count),
        totalPaid: parseFloat(totalPaidResult.rows[0].total),
        statusDistribution,
        programDistribution,
        monthlyTrend
      }
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({ error: 'Lỗi lấy dữ liệu báo cáo' });
  }
});

// ============= ADMIN PANEL APIs =============

// Get user statistics
app.get('/api/admin/users/stats', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users');
    const citizenCount = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'CITIZEN'");
    const officerCount = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'OFFICER'");
    const adminCount = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'");

    res.json({
      success: true,
      stats: {
        total: parseInt(totalUsers.rows[0].count),
        citizens: parseInt(citizenCount.rows[0].count),
        officers: parseInt(officerCount.rows[0].count),
        admins: parseInt(adminCount.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Lỗi lấy thống kê người dùng' });
  }
});

// Get users list with pagination, search, filter
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(LOWER(full_name) LIKE LOWER($${paramIndex}) OR LOWER(email) LIKE LOWER($${paramIndex + 1}))`);
      params.push(`%${search}%`, `%${search}%`);
      paramIndex += 2;
    }

    if (role) {
      whereConditions.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM users ${whereClause}`,
      params
    );

    params.push(parseInt(limit));
    params.push(offset);

    const usersResult = await pool.query(
      `SELECT id, full_name, email, role, created_at 
       FROM users 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    res.json({
      success: true,
      users: usersResult.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách người dùng' });
  }
});

// Create new user
app.post('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, created_at`,
      [full_name, email, hashedPassword, role]
    );

    res.json({
      success: true,
      user: result.rows[0],
      message: 'Tạo người dùng thành công'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Lỗi tạo người dùng' });
  }
});

// Update user
app.put('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, role, password } = req.body;

    if (!full_name || !email || !role) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }

    let query, params;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `UPDATE users 
               SET full_name = $1, email = $2, role = $3, password_hash = $4
               WHERE id = $5
               RETURNING id, full_name, email, role, created_at`;
      params = [full_name, email, role, hashedPassword, id];
    } else {
      query = `UPDATE users 
               SET full_name = $1, email = $2, role = $3
               WHERE id = $4
               RETURNING id, full_name, email, role, created_at`;
      params = [full_name, email, role, id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    res.json({
      success: true,
      user: result.rows[0],
      message: 'Cập nhật người dùng thành công'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật người dùng' });
  }
});

// Delete user
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Lỗi xóa người dùng' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
