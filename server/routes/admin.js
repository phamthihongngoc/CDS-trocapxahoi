// ========================================
// ADMIN ADVANCED FEATURES - API ROUTES
// Phase 1-3 Implementation
// ========================================

import express from 'express';
import db from '../db.js';

const router = express.Router();

// ========================================
// MIDDLEWARE: Verify Admin Role
// ========================================
const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Chỉ Admin mới có quyền truy cập' });
  }
  next();
};

// ========================================
// PHASE 1: PROGRAMS MANAGEMENT
// ========================================

// GET /api/admin/programs - Get all programs with stats
router.get('/programs', requireAdmin, (req, res) => {
  try {
    const programs = db.prepare(`
      SELECT 
        p.*,
        COUNT(DISTINCT a.id) as application_count,
        SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN a.status = 'approved' THEN p.amount ELSE 0 END) as total_amount
      FROM support_programs p
      LEFT JOIN applications a ON a.program_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `).all();

    res.json({ success: true, programs });
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ error: 'Không thể tải danh sách chương trình' });
  }
});

// POST /api/admin/programs - Create new program
router.post('/programs', requireAdmin, (req, res) => {
  try {
    const {code, name, description, type, amount, start_date, end_date, status } = req.body;

    if (!code || !name) {
      return res.status(400).json({ error: 'Mã và tên chương trình là bắt buộc' });
    }

    const result = db.prepare(`
      INSERT INTO support_programs (code, name, description, type, amount, start_date, end_date, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(code, name, description, type, amount, start_date, end_date, status || 'active', req.userId);

    // Log action
    db.prepare(`
      INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, new_value, status)
      VALUES (?, 'CREATE', 'PROGRAM', ?, ?, 'success')
    `).run(req.userId, result.lastInsertRowid, JSON.stringify(req.body));

    res.json({
      success: true,
      message: 'Tạo chương trình thành công',
      programId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ error: error.message || 'Không thể tạo chương trình' });
  }
});

// PUT /api/admin/programs/:id - Update program
router.put('/programs/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, type, amount, start_date, end_date, status } = req.body;

    // Get old value for audit
    const oldProgram = db.prepare('SELECT * FROM support_programs WHERE id = ?').get(id);
    if (!oldProgram) {
      return res.status(404).json({ error: 'Không tìm thấy chương trình' });
    }

    db.prepare(`
      UPDATE support_programs
      SET code = ?, name = ?, description = ?, type = ?, amount = ?, 
          start_date = ?, end_date = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(code, name, description, type, amount, start_date, end_date, status, id);

    // Log action
    db.prepare(`
      INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, old_value, new_value, status)
      VALUES (?, 'UPDATE', 'PROGRAM', ?, ?, ?, 'success')
    `).run(req.userId, id, JSON.stringify(oldProgram), JSON.stringify(req.body));

    res.json({ success: true, message: 'Cập nhật chương trình thành công' });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ error: 'Không thể cập nhật chương trình' });
  }
});

// DELETE /api/admin/programs/:id - Delete program (soft delete)
router.delete('/programs/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const program = db.prepare('SELECT * FROM support_programs WHERE id = ?').get(id);
    if (!program) {
      return res.status(404).json({ error: 'Không tìm thấy chương trình' });
    }

    // Soft delete
    db.prepare(`
      UPDATE support_programs
      SET status = 'inactive', updated_at = datetime('now')
      WHERE id = ?
    `).run(id);

    // Log action
    db.prepare(`
      INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, old_value, status)
      VALUES (?, 'DELETE', 'PROGRAM', ?, ?, 'success')
    `).run(req.userId, id, JSON.stringify(program));

    res.json({ success: true, message: 'Xóa chương trình thành công' });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ error: 'Không thể xóa chương trình' });
  }
});

// ========================================
// PHASE 1: AUDIT LOGS
// ========================================

// GET /api/admin/logs - Get audit logs with filters
router.get('/logs', requireAdmin, (req, res) => {
  try {
    const { action_type, entity_type, user_id, start_date, end_date, page = 1, limit = 50 } = req.query;

    let query = `
      SELECT 
        al.*,
        u.full_name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (action_type) {
      query += ` AND al.action_type = ?`;
      params.push(action_type);
    }
    if (entity_type) {
      query += ` AND al.entity_type = ?`;
      params.push(entity_type);
    }
    if (user_id) {
      query += ` AND al.user_id = ?`;
      params.push(user_id);
    }
    if (start_date) {
      query += ` AND date(al.created_at) >= date(?)`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND date(al.created_at) <= date(?)`;
      params.push(end_date);
    }

    query += ` ORDER BY al.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const logs = db.prepare(query).all(...params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM audit_logs WHERE 1=1`;
    const countParams = [];
    if (action_type) {
      countQuery += ` AND action_type = ?`;
      countParams.push(action_type);
    }
    if (entity_type) {
      countQuery += ` AND entity_type = ?`;
      countParams.push(entity_type);
    }
    if (user_id) {
      countQuery += ` AND user_id = ?`;
      countParams.push(user_id);
    }

    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Không thể tải nhật ký' });
  }
});

// GET /api/admin/logs/stats - Get audit log statistics
router.get('/logs/stats', requireAdmin, (req, res) => {
  try {
    const stats = {
      totalActions: db.prepare('SELECT COUNT(*) as count FROM audit_logs').get().count,
      byActionType: db.prepare(`
        SELECT action_type, COUNT(*) as count
        FROM audit_logs
        GROUP BY action_type
        ORDER BY count DESC
      `).all(),
      byEntityType: db.prepare(`
        SELECT entity_type, COUNT(*) as count
        FROM audit_logs
        GROUP BY entity_type
        ORDER BY count DESC
      `).all(),
      recentActivity: db.prepare(`
        SELECT 
          al.*,
          u.full_name as user_name
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 10
      `).all(),
      topUsers: db.prepare(`
        SELECT 
          u.full_name,
          u.email,
          COUNT(*) as action_count
        FROM audit_logs al
        JOIN users u ON al.user_id = u.id
        GROUP BY al.user_id
        ORDER BY action_count DESC
        LIMIT 5
      `).all()
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    res.status(500).json({ error: 'Không thể tải thống kê' });
  }
});

// ========================================
// PHASE 1: DASHBOARD ADVANCED
// ========================================

// GET /api/admin/dashboard/stats - Get dashboard statistics
router.get('/dashboard/stats', requireAdmin, (req, res) => {
  try {
    const stats = {
      // General stats
      totalApplications: db.prepare('SELECT COUNT(*) as count FROM applications').get().count,
      totalComplaints: db.prepare('SELECT COUNT(*) as count FROM complaints').get().count,
      totalPayouts: db.prepare('SELECT COUNT(*) as count FROM payouts WHERE status = "completed"').get().count,
      totalUsers: db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "CITIZEN"').get().count,
      totalOfficers: db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "OFFICER"').get().count,

      // Status distribution
      applicationsByStatus: db.prepare(`
        SELECT status, COUNT(*) as count
        FROM applications
        GROUP BY status
      `).all(),

      complaintsByStatus: db.prepare(`
        SELECT status, COUNT(*) as count
        FROM complaints
        GROUP BY status
      `).all(),

      // Recent activity (last 30 days)
      recentApplications: db.prepare(`
        SELECT COUNT(*) as count
        FROM applications
        WHERE date(created_at) >= date('now', '-30 days')
      `).get().count,

      recentComplaints: db.prepare(`
        SELECT COUNT(*) as count
        FROM complaints
        WHERE date(created_at) >= date('now', '-30 days')
      `).get().count,

      // Top programs
      topPrograms: db.prepare(`
        SELECT 
          sp.name,
          COUNT(a.id) as application_count,
          SUM(CASE WHEN a.status = 'approved' THEN sp.amount ELSE 0 END) as total_amount
        FROM support_programs sp
        LEFT JOIN applications a ON a.program_id = sp.id
        GROUP BY sp.id
        ORDER BY application_count DESC
        LIMIT 5
      `).all(),

      // Pending items
      pendingApplications: db.prepare(`
        SELECT COUNT(*) as count FROM applications WHERE status = 'pending'
      `).get().count,

      pendingComplaints: db.prepare(`
        SELECT COUNT(*) as count FROM complaints WHERE status = 'pending'
      `).get().count,

      pendingPayouts: db.prepare(`
        SELECT COUNT(*) as count FROM payouts WHERE status = 'pending'
      `).get().count,
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Không thể tải thống kê' });
  }
});

// GET /api/admin/dashboard/alerts - Get system alerts
router.get('/dashboard/alerts', requireAdmin, (req, res) => {
  try {
    const alerts = db.prepare(`
      SELECT * FROM system_alerts
      WHERE is_resolved = 0
      ORDER BY 
        CASE severity
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          ELSE 4
        END,
        created_at DESC
      LIMIT 20
    `).all();

    res.json({ success: true, alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Không thể tải cảnh báo' });
  }
});

// POST /api/admin/dashboard/alerts/:id/resolve - Resolve an alert
router.post('/dashboard/alerts/:id/resolve', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    db.prepare(`
      UPDATE system_alerts
      SET is_resolved = 1, resolved_by = ?, resolved_at = datetime('now')
      WHERE id = ?
    `).run(req.userId, id);

    res.json({ success: true, message: 'Đã giải quyết cảnh báo' });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ error: 'Không thể giải quyết cảnh báo' });
  }
});

export default router;
