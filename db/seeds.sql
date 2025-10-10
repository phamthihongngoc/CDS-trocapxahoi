-- Initial Seed Data for Social Welfare Support System
-- Password for all users: 123456 (hashed with bcrypt)

-- ========================================
-- 1. USERS (3 roles: CITIZEN, OFFICER, ADMIN)
-- ========================================
INSERT OR REPLACE INTO users (id, full_name, email, phone, address, password_hash, role, status) VALUES
(1, 'Nguyễn Văn A', 'citizen@example.com', '0123456789', 'Thôn 1, Xã Hoàng Đồng, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(2, 'Trần Thị Bình', 'officer@langson.gov.vn', '0912345678', 'UBND Xã Hoàng Đồng, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'OFFICER', 'active'),
(3, 'Quản trị viên', 'admin@langson.gov.vn', '0901234567', 'UBND Tỉnh Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'ADMIN', 'active');

-- ========================================
-- 2. SUPPORT PROGRAMS
-- ========================================
INSERT OR IGNORE INTO support_programs (code, name, description, type, amount, start_date, end_date, status, created_by) VALUES
('TC001', 'Trợ cấp người khuyết tật', 'Hỗ trợ hàng tháng cho người khuyết tật nặng', 'Khuyết tật', 540000, '2024-01-01', '2024-12-31', 'active', 1),
('TC002', 'Trợ cấp hộ nghèo', 'Hỗ trợ sinh hoạt phí cho hộ nghèo', 'Hộ nghèo', 350000, '2024-01-01', '2024-12-31', 'active', 1),
('TC003', 'Trợ cấp trẻ mồ côi', 'Nuôi dưỡng trẻ em mồ côi dưới 16 tuổi', 'Trẻ em', 600000, '2024-01-01', '2024-12-31', 'active', 1);

-- ========================================
-- 3. SAMPLE APPLICATIONS
-- ========================================
INSERT OR IGNORE INTO applications (code, user_id, program_id, citizen_id, full_name, date_of_birth, gender, phone, email, address, district, commune, village, application_type, support_amount, status, submitted_at) VALUES
('APP001', 1, 1, '123456789012', 'Nguyễn Văn A', '1990-01-15', 'Nam', '0123456789', 'citizen@example.com', 'Thôn 1, Xã Hoàng Đồng', 'Dinh Lập', 'Hoàng Đồng', 'Thôn 1', 'Người khuyết tật', 540000, 'approved', '2024-01-15'),
('APP002', 1, 2, '234567890123', 'Trần Thị C', '1985-05-20', 'Nữ', '0987654321', 'citizen@example.com', 'Thôn 2, Xã Tân Phú', 'Dinh Lập', 'Tân Phú', 'Thôn 2', 'Hộ nghèo', 350000, 'pending', '2024-01-18');

-- ========================================
-- 4. SYSTEM SETTINGS (Default configuration)
-- ========================================
INSERT OR REPLACE INTO system_settings (key, value, type, description) VALUES
('system_name', 'Hệ thống Bảo trợ Xã hội Tỉnh Lạng Sơn', 'text', 'Tên hệ thống hiển thị'),
('system_logo', '/attached_assets/lg_1760024752596.png', 'text', 'Đường dẫn logo hệ thống'),
('contact_email', 'support@langson.gov.vn', 'text', 'Email liên hệ hệ thống'),
('contact_phone', '0260-3870-xxx', 'text', 'Số điện thoại liên hệ');
