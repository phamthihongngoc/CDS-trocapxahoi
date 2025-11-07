// ========================================
// ADMIN ADVANCED FEATURES - PHASE 3 APIs
// Backup, Security & Automation
// ========================================

import express from 'express';
import db from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Chỉ Admin mới có quyền truy cập' });
  }
  next();
};

// ========================================
// PHASE 3: BACKUP & RESTORE
// ========================================

// GET /api/admin/backups - Get all backups
router.get('/backups', requireAdmin, (req, res) => {
  try {
    const backups = db.prepare(`
      SELECT 
        b.*,
        u.full_name as created_by_name
      FROM backups b
      LEFT JOIN users u ON b.created_by = u.id
      ORDER BY b.created_at DESC
    `).all();

    res.json({ success: true, backups });
  } catch (error) {
    console.error('Error fetching backups:', error);
    res.status(500).json({ error: 'Không thể tải danh sách backup' });
  }
});

// POST /api/admin/backups/create - Create manual backup
router.post('/backups/create', requireAdmin, async (req, res) => {
  try {
    const { backup_name } = req.body;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${timestamp}.db`;
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    const backupPath = path.join(backupDir, fileName);

    // Create backups directory if not exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Insert backup record
    const result = db.prepare(`
      INSERT INTO backups (backup_name, backup_type, file_path, status, created_by)
      VALUES (?, 'manual', ?, 'in_progress', ?)
    `).run(backup_name || `Manual Backup ${timestamp}`, backupPath, req.userId);

    const backupId = result.lastInsertRowid;

    // Create backup (copy database file)
    try {
      const sourceDb = path.join(__dirname, '..', '..', 'db', 'socialwelfare.db');
      fs.copyFileSync(sourceDb, backupPath);
      
      const stats = fs.statSync(backupPath);
      
      // Update backup record
      db.prepare(`
        UPDATE backups
        SET status = 'completed', file_size = ?, completed_at = datetime('now')
        WHERE id = ?
      `).run(stats.size, backupId);

      // Log action
      db.prepare(`
        INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, new_value, status)
        VALUES (?, 'CREATE', 'BACKUP', ?, ?, 'success')
      `).run(req.userId, backupId, JSON.stringify({ file_name: fileName, size: stats.size }));

      res.json({
        success: true,
        message: 'Backup thành công',
        backup: {
          id: backupId,
          file_name: fileName,
          file_size: stats.size
        }
      });
    } catch (error) {
      // Update backup record as failed
      db.prepare(`
        UPDATE backups
        SET status = 'failed', error_message = ?
        WHERE id = ?
      `).run(error.message, backupId);

      throw error;
    }
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Không thể tạo backup: ' + error.message });
  }
});

// POST /api/admin/backups/:id/restore - Restore from backup
router.post('/backups/:id/restore', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const backup = db.prepare('SELECT * FROM backups WHERE id = ?').get(id);
    if (!backup) {
      return res.status(404).json({ error: 'Không tìm thấy backup' });
    }

    if (backup.status !== 'completed') {
      return res.status(400).json({ error: 'Backup chưa hoàn thành' });
    }

    if (!fs.existsSync(backup.file_path)) {
      return res.status(404).json({ error: 'File backup không tồn tại' });
    }

    // Note: Actual restore would require stopping the server
    // This is a simplified version
    res.json({
      success: true,
      message: 'Yêu cầu khôi phục đã được ghi nhận. Vui lòng dừng server và khôi phục thủ công.',
      warning: 'Khôi phục sẽ thay thế toàn bộ dữ liệu hiện tại!'
    });

    // Log action
    db.prepare(`
      INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, new_value, status)
      VALUES (?, 'RESTORE', 'BACKUP', ?, ?, 'success')
    `).run(req.userId, id, JSON.stringify({ backup_name: backup.backup_name }));

  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ error: 'Không thể khôi phục backup' });
  }
});

// DELETE /api/admin/backups/:id - Delete backup
router.delete('/backups/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const backup = db.prepare('SELECT * FROM backups WHERE id = ?').get(id);
    if (!backup) {
      return res.status(404).json({ error: 'Không tìm thấy backup' });
    }

    // Delete file
    if (fs.existsSync(backup.file_path)) {
      fs.unlinkSync(backup.file_path);
    }

    // Delete record
    db.prepare('DELETE FROM backups WHERE id = ?').run(id);

    // Log action
    db.prepare(`
      INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, old_value, status)
      VALUES (?, 'DELETE', 'BACKUP', ?, ?, 'success')
    `).run(req.userId, id, JSON.stringify(backup));

    res.json({ success: true, message: 'Xóa backup thành công' });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ error: 'Không thể xóa backup' });
  }
});

// ========================================
// PHASE 3: SECURITY MANAGEMENT
// ========================================

// GET /api/admin/security/logs - Get security logs
router.get('/security/logs', requireAdmin, (req, res) => {
  try {
    const { event_type, severity, start_date, end_date, limit = 100 } = req.query;

    let query = `
      SELECT 
        sl.*,
        u.full_name as user_name,
        u.email as user_email
      FROM security_logs sl
      LEFT JOIN users u ON sl.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (event_type) {
      query += ` AND sl.event_type = ?`;
      params.push(event_type);
    }
    if (severity) {
      query += ` AND sl.severity = ?`;
      params.push(severity);
    }
    if (start_date) {
      query += ` AND date(sl.created_at) >= date(?)`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND date(sl.created_at) <= date(?)`;
      params.push(end_date);
    }

    query += ` ORDER BY sl.created_at DESC LIMIT ?`;
    params.push(parseInt(limit));

    const logs = db.prepare(query).all(...params);

    res.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching security logs:', error);
    res.status(500).json({ error: 'Không thể tải nhật ký bảo mật' });
  }
});

// GET /api/admin/system-settings - Get all system settings
router.get('/system-settings', requireAdmin, (req, res) => {
  try {
    const { category } = req.query;

    let query = 'SELECT * FROM system_settings WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY category, setting_key';

    const settings = db.prepare(query).all(...params);

    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ error: 'Không thể tải cài đặt' });
  }
});

// PUT /api/admin/system-settings/:key - Update system setting
router.put('/system-settings/:key', requireAdmin, (req, res) => {
  try {
    const { key } = req.params;
    const { setting_value } = req.body;

    const oldSetting = db.prepare('SELECT * FROM system_settings WHERE setting_key = ?').get(key);
    if (!oldSetting) {
      return res.status(404).json({ error: 'Không tìm thấy cài đặt' });
    }

    db.prepare(`
      UPDATE system_settings
      SET setting_value = ?, updated_by = ?, updated_at = datetime('now')
      WHERE setting_key = ?
    `).run(setting_value, req.userId, key);

    // Log action
    db.prepare(`
      INSERT INTO audit_logs (user_id, action_type, entity_type, old_value, new_value, status)
      VALUES (?, 'UPDATE', 'SYSTEM_SETTING', ?, ?, 'success')
    `).run(req.userId, JSON.stringify(oldSetting), JSON.stringify({ setting_key: key, setting_value }));

    res.json({ success: true, message: 'Cập nhật cài đặt thành công' });
  } catch (error) {
    console.error('Error updating system setting:', error);
    res.status(500).json({ error: 'Không thể cập nhật cài đặt' });
  }
});

// ========================================
// PHASE 3: AUTOMATION
// ========================================

// GET /api/admin/automation/rules - Get all automation rules
router.get('/automation/rules', requireAdmin, (req, res) => {
  try {
    const rules = db.prepare(`
      SELECT 
        ar.*,
        u.full_name as created_by_name
      FROM automation_rules ar
      LEFT JOIN users u ON ar.created_by = u.id
      ORDER BY ar.created_at DESC
    `).all();

    res.json({ success: true, rules });
  } catch (error) {
    console.error('Error fetching automation rules:', error);
    res.status(500).json({ error: 'Không thể tải quy tắc tự động' });
  }
});

// POST /api/admin/automation/rules - Create automation rule
router.post('/automation/rules', requireAdmin, (req, res) => {
  try {
    const { rule_name, rule_type, trigger_event, conditions, actions } = req.body;

    if (!rule_name || !rule_type || !trigger_event) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const result = db.prepare(`
      INSERT INTO automation_rules (rule_name, rule_type, trigger_event, conditions, actions, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      rule_name,
      rule_type,
      trigger_event,
      JSON.stringify(conditions || {}),
      JSON.stringify(actions || {}),
      req.userId
    );

    res.json({
      success: true,
      message: 'Tạo quy tắc tự động thành công',
      ruleId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating automation rule:', error);
    res.status(500).json({ error: 'Không thể tạo quy tắc tự động' });
  }
});

// PUT /api/admin/automation/rules/:id - Update automation rule
router.put('/automation/rules/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { rule_name, rule_type, trigger_event, conditions, actions, is_active } = req.body;

    db.prepare(`
      UPDATE automation_rules
      SET rule_name = ?, rule_type = ?, trigger_event = ?, conditions = ?, 
          actions = ?, is_active = ?, updated_by = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      rule_name,
      rule_type,
      trigger_event,
      JSON.stringify(conditions),
      JSON.stringify(actions),
      is_active,
      req.userId,
      id
    );

    res.json({ success: true, message: 'Cập nhật quy tắc thành công' });
  } catch (error) {
    console.error('Error updating automation rule:', error);
    res.status(500).json({ error: 'Không thể cập nhật quy tắc' });
  }
});

// DELETE /api/admin/automation/rules/:id - Delete automation rule
router.delete('/automation/rules/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM automation_rules WHERE id = ?').run(id);
    res.json({ success: true, message: 'Xóa quy tắc thành công' });
  } catch (error) {
    console.error('Error deleting automation rule:', error);
    res.status(500).json({ error: 'Không thể xóa quy tắc' });
  }
});

// GET /api/admin/scheduled-tasks - Get all scheduled tasks
router.get('/scheduled-tasks', requireAdmin, (req, res) => {
  try {
    const tasks = db.prepare(`
      SELECT 
        st.*,
        u.full_name as created_by_name
      FROM scheduled_tasks st
      LEFT JOIN users u ON st.created_by = u.id
      ORDER BY st.created_at DESC
    `).all();

    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching scheduled tasks:', error);
    res.status(500).json({ error: 'Không thể tải tác vụ định kỳ' });
  }
});

// POST /api/admin/scheduled-tasks - Create scheduled task
router.post('/scheduled-tasks', requireAdmin, (req, res) => {
  try {
    const { task_name, task_type, schedule, parameters } = req.body;

    if (!task_name || !task_type || !schedule) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const result = db.prepare(`
      INSERT INTO scheduled_tasks (task_name, task_type, schedule, parameters, created_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      task_name,
      task_type,
      schedule,
      JSON.stringify(parameters || {}),
      req.userId
    );

    res.json({
      success: true,
      message: 'Tạo tác vụ định kỳ thành công',
      taskId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating scheduled task:', error);
    res.status(500).json({ error: 'Không thể tạo tác vụ định kỳ' });
  }
});

export default router;
