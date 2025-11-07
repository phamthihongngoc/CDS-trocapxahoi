// ========================================
// ADMIN ADVANCED FEATURES - PHASE 2 APIs
// Notifications & Officer Management
// ========================================

import express from 'express';
import db from '../db.js';

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Chỉ Admin mới có quyền truy cập' });
  }
  next();
};

// ========================================
// PHASE 2: NOTIFICATIONS SYSTEM
// ========================================

// GET /api/admin/notifications - Get all notifications
router.get('/notifications', requireAdmin, (req, res) => {
  try {
    const { user_id, type, category, is_read, page = 1, limit = 50 } = req.query;

    let query = `
      SELECT 
        n.*,
        u.full_name as user_name,
        u.email as user_email
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      query += ` AND n.user_id = ?`;
      params.push(user_id);
    }
    if (type) {
      query += ` AND n.type = ?`;
      params.push(type);
    }
    if (category) {
      query += ` AND n.category = ?`;
      params.push(category);
    }
    if (is_read !== undefined) {
      query += ` AND n.is_read = ?`;
      params.push(is_read === 'true' ? 1 : 0);
    }

    query += ` ORDER BY n.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const notifications = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM notifications').get().count;

    res.json({
      success: true,
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Không thể tải thông báo' });
  }
});

// POST /api/admin/notifications/broadcast - Send broadcast notification
router.post('/notifications/broadcast', requireAdmin, (req, res) => {
  try {
    const { title, message, type, category, target_role } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Tiêu đề và nội dung là bắt buộc' });
    }

    // Get target users
    let users;
    if (target_role) {
      users = db.prepare('SELECT id FROM users WHERE role = ?').all(target_role);
    } else {
      users = db.prepare('SELECT id FROM users').all();
    }

    // Insert notifications for all users
    const insertNotification = db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, category, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((usersList) => {
      for (const user of usersList) {
        insertNotification.run(user.id, title, message, type || 'info', category, req.userId);
      }
    });

    insertMany(users);

    // Log action
    db.prepare(`
      INSERT INTO audit_logs (user_id, action_type, entity_type, new_value, status)
      VALUES (?, 'CREATE', 'NOTIFICATION_BROADCAST', ?, 'success')
    `).run(req.userId, JSON.stringify({ title, target_count: users.length }));

    res.json({
      success: true,
      message: `Đã gửi thông báo đến ${users.length} người dùng`
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({ error: 'Không thể gửi thông báo' });
  }
});

// GET /api/admin/notification-templates - Get all templates
router.get('/notification-templates', requireAdmin, (req, res) => {
  try {
    const templates = db.prepare(`
      SELECT * FROM notification_templates
      ORDER BY created_at DESC
    `).all();

    res.json({ success: true, templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Không thể tải mẫu thông báo' });
  }
});

// POST /api/admin/notification-templates - Create template
router.post('/notification-templates', requireAdmin, (req, res) => {
  try {
    const { name, code, template_type, subject, content, variables } = req.body;

    if (!name || !code || !content) {
      return res.status(400).json({ error: 'Tên, mã và nội dung là bắt buộc' });
    }

    const result = db.prepare(`
      INSERT INTO notification_templates (name, code, template_type, subject, content, variables, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, code, template_type || 'email', subject, content, JSON.stringify(variables || []), req.userId);

    res.json({
      success: true,
      message: 'Tạo mẫu thông báo thành công',
      templateId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: error.message || 'Không thể tạo mẫu thông báo' });
  }
});

// PUT /api/admin/notification-templates/:id - Update template
router.put('/notification-templates/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, template_type, subject, content, variables, is_active } = req.body;

    db.prepare(`
      UPDATE notification_templates
      SET name = ?, code = ?, template_type = ?, subject = ?, content = ?, 
          variables = ?, is_active = ?, updated_by = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(name, code, template_type, subject, content, JSON.stringify(variables), is_active, req.userId, id);

    res.json({ success: true, message: 'Cập nhật mẫu thông báo thành công' });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Không thể cập nhật mẫu thông báo' });
  }
});

// ========================================
// PHASE 2: OFFICER MANAGEMENT ADVANCED
// ========================================

// GET /api/admin/officers/performance - Get officer performance metrics
router.get('/officers/performance', requireAdmin, (req, res) => {
  try {
    const { officer_id, start_date, end_date } = req.query;

    let query = `
      SELECT 
        u.id,
        u.full_name,
        u.email,
        COUNT(DISTINCT a.id) as total_applications,
        SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) as approved_applications,
        SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) as rejected_applications,
        COUNT(DISTINCT c.id) as total_complaints,
        SUM(CASE WHEN c.status = 'resolved' THEN 1 ELSE 0 END) as resolved_complaints,
        ROUND(AVG(JULIANDAY(a.updated_at) - JULIANDAY(a.created_at)) * 24, 2) as avg_processing_hours
      FROM users u
      LEFT JOIN applications a ON a.assigned_to = u.id
      LEFT JOIN complaints c ON c.assigned_to = u.id
      WHERE u.role = 'OFFICER'
    `;
    const params = [];

    if (officer_id) {
      query += ` AND u.id = ?`;
      params.push(officer_id);
    }
    if (start_date) {
      query += ` AND date(a.created_at) >= date(?)`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND date(a.created_at) <= date(?)`;
      params.push(end_date);
    }

    query += ` GROUP BY u.id ORDER BY total_applications DESC`;

    const performance = db.prepare(query).all(...params);

    res.json({ success: true, performance });
  } catch (error) {
    console.error('Error fetching officer performance:', error);
    res.status(500).json({ error: 'Không thể tải hiệu suất cán bộ' });
  }
});

// GET /api/admin/officers/workload - Get current workload of officers
router.get('/officers/workload', requireAdmin, (req, res) => {
  try {
    const workload = db.prepare(`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        COUNT(DISTINCT CASE WHEN a.status IN ('pending', 'under_review') THEN a.id END) as pending_applications,
        COUNT(DISTINCT CASE WHEN c.status = 'pending' THEN c.id END) as pending_complaints,
        (COUNT(DISTINCT CASE WHEN a.status IN ('pending', 'under_review') THEN a.id END) * 2 +
         COUNT(DISTINCT CASE WHEN c.status = 'pending' THEN c.id END) * 1.5) as workload_score,
        CASE 
          WHEN (COUNT(DISTINCT CASE WHEN a.status IN ('pending', 'under_review') THEN a.id END) * 2 +
                COUNT(DISTINCT CASE WHEN c.status = 'pending' THEN c.id END) * 1.5) > 20 THEN 'overloaded'
          WHEN (COUNT(DISTINCT CASE WHEN a.status IN ('pending', 'under_review') THEN a.id END) * 2 +
                COUNT(DISTINCT CASE WHEN c.status = 'pending' THEN c.id END) * 1.5) > 10 THEN 'busy'
          ELSE 'available'
        END as status
      FROM users u
      LEFT JOIN applications a ON a.assigned_to = u.id
      LEFT JOIN complaints c ON c.assigned_to = u.id
      WHERE u.role = 'OFFICER'
      GROUP BY u.id
      ORDER BY workload_score ASC
    `).all();

    res.json({ success: true, workload });
  } catch (error) {
    console.error('Error fetching officer workload:', error);
    res.status(500).json({ error: 'Không thể tải khối lượng công việc' });
  }
});

// GET /api/admin/officers/:id/activity - Get officer activity log
router.get('/officers/:id/activity', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, limit = 100 } = req.query;

    let query = `
      SELECT 
        al.*,
        u.full_name as user_name
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      WHERE al.user_id = ?
    `;
    const params = [id];

    if (start_date) {
      query += ` AND date(al.created_at) >= date(?)`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND date(al.created_at) <= date(?)`;
      params.push(end_date);
    }

    query += ` ORDER BY al.created_at DESC LIMIT ?`;
    params.push(parseInt(limit));

    const activities = db.prepare(query).all(...params);

    res.json({ success: true, activities });
  } catch (error) {
    console.error('Error fetching officer activity:', error);
    res.status(500).json({ error: 'Không thể tải hoạt động cán bộ' });
  }
});

// POST /api/admin/officers/assign - Auto-assign application/complaint to officer
router.post('/officers/assign', requireAdmin, (req, res) => {
  try {
    const { entity_type, entity_id } = req.body;

    if (!entity_type || !entity_id) {
      return res.status(400).json({ error: 'Loại và ID thực thể là bắt buộc' });
    }

    // Find officer with lowest workload
    const officer = db.prepare(`
      SELECT 
        u.id,
        u.full_name,
        COUNT(DISTINCT a.id) as current_workload
      FROM users u
      LEFT JOIN applications a ON a.assigned_to = u.id AND a.status IN ('pending', 'under_review')
      WHERE u.role = 'OFFICER' AND u.status = 'active'
      GROUP BY u.id
      ORDER BY current_workload ASC
      LIMIT 1
    `).get();

    if (!officer) {
      return res.status(404).json({ error: 'Không tìm thấy cán bộ khả dụng' });
    }

    // Assign to officer
    const table = entity_type === 'APPLICATION' ? 'applications' : 'complaints';
    db.prepare(`
      UPDATE ${table}
      SET assigned_to = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(officer.id, entity_id);

    // Log action
    db.prepare(`
      INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, new_value, status)
      VALUES (?, 'ASSIGN', ?, ?, ?, 'success')
    `).run(req.userId, entity_type, entity_id, JSON.stringify({ assigned_to: officer.id }));

    res.json({
      success: true,
      message: `Đã phân công cho ${officer.full_name}`,
      officer_id: officer.id
    });
  } catch (error) {
    console.error('Error assigning to officer:', error);
    res.status(500).json({ error: 'Không thể phân công' });
  }
});

export default router;
