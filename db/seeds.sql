-- Initial Seed Data for Social Welfare Support System
-- Password for all users: 123456 (hashed with bcrypt)

-- ========================================
-- 1. USERS (20 Citizens + 3 Officers + 1 Admin)
-- ========================================
-- Password hash for '123456': $2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e

-- 20 CITIZENS (Người dân) - Đăng nhập bằng CCCD
INSERT OR IGNORE INTO users (id, full_name, citizen_id, email, phone, address, password_hash, role, status) VALUES
(1, 'Nguyễn Văn An', '001098123456', 'nguyenvanan@example.com', '0912345001', 'Thôn 1, Xã Hoàng Đồng, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(2, 'Trần Thị Bình', '001098234567', 'tranthbinh@example.com', '0912345002', 'Thôn 2, Xã Hoàng Đồng, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(3, 'Lê Văn Cường', '001098345678', 'levancuong@example.com', '0912345003', 'Thôn 3, Xã Tân Phú, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(4, 'Phạm Thị Dung', '001098456789', 'phamthidung@example.com', '0912345004', 'Thôn 4, Xã Hoàng Văn Thụ, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(5, 'Hoàng Văn Em', '001098567890', 'hoangvanem@example.com', '0912345005', 'Thôn 5, Xã Bắc Sơn, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(6, 'Đỗ Thị Phượng', '001098678901', 'dothiphuong@example.com', '0912345006', 'Thôn 6, Xã Cao Lộc, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(7, 'Vũ Văn Giang', '001098789012', 'vuvangiang@example.com', '0912345007', 'Thôn 1, Xã Văn Quan, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(8, 'Bùi Thị Hoa', '001098890123', 'buithihoa@example.com', '0912345008', 'Thôn 2, Xã Hữu Lũng, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(9, 'Đinh Văn Inh', '001098901234', 'dinhvaninh@example.com', '0912345009', 'Thôn 3, Xã Tràng Định, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(10, 'Ngô Thị Kim', '001099012345', 'ngothikim@example.com', '0912345010', 'Thôn 4, Xã Bình Gia, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(11, 'Phan Văn Long', '001099123456', 'phanvanlong@example.com', '0912345011', 'Thôn 5, Xã Chi Lăng, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(12, 'Dương Thị Mai', '001099234567', 'duongthimai@example.com', '0912345012', 'Thôn 6, Xã Lộc Bình, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(13, 'Lý Văn Nam', '001099345678', 'lyvannam@example.com', '0912345013', 'Thôn 1, Xã Đình Lập, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(14, 'Võ Thị Oanh', '001099456789', 'vothioanh@example.com', '0912345014', 'Thôn 2, Xã Văn Lãng, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(15, 'Mai Văn Phong', '001099567890', 'maivanphong@example.com', '0912345015', 'Thôn 3, Xã Cao Bằng, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(16, 'Chu Thị Quỳnh', '001099678901', 'chuthiquynh@example.com', '0912345016', 'Thôn 4, Xã Hoàng Đồng, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(17, 'Tô Văn Sơn', '001099789012', 'tovanson@example.com', '0912345017', 'Thôn 5, Xã Tân Phú, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(18, 'Hà Thị Tuyết', '001099890123', 'hathituyet@example.com', '0912345018', 'Thôn 6, Xã Bắc Sơn, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(19, 'Trương Văn Uy', '001099901234', 'truongvanuy@example.com', '0912345019', 'Thôn 1, Xã Cao Lộc, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),
(20, 'Lưu Thị Vân', '001100012345', 'luuthivan@example.com', '0912345020', 'Thôn 2, Xã Văn Quan, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'CITIZEN', 'active'),

-- 3 OFFICERS (Cán bộ) - Đăng nhập bằng CCCD hoặc Email
(21, 'Trần Văn Xuân', '025088123456', 'officer1@langson.gov.vn', '0901234501', 'UBND Xã Hoàng Đồng, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'OFFICER', 'active'),
(22, 'Nguyễn Thị Yến', '025088234567', 'officer2@langson.gov.vn', '0901234502', 'UBND Xã Tân Phú, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'OFFICER', 'active'),
(23, 'Phạm Văn Zung', '025088345678', 'officer3@langson.gov.vn', '0901234503', 'UBND Xã Bắc Sơn, Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'OFFICER', 'active'),

-- 1 ADMIN (Quản trị viên) - Đăng nhập bằng CCCD hoặc Email
(24, 'Hoàng Văn Tài', '035099123456', 'admin@langson.gov.vn', '0900000001', 'UBND Tỉnh Lạng Sơn', '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e', 'ADMIN', 'active');

-- ========================================
-- 2. SUPPORT PROGRAMS
-- ========================================
INSERT OR IGNORE INTO support_programs (code, name, description, type, amount, start_date, end_date, status, created_by) VALUES
('TC001', 'Trợ cấp người khuyết tật', 'Hỗ trợ hàng tháng cho người khuyết tật nặng', 'Khuyết tật', 540000, '2024-01-01', '2024-12-31', 'active', 1),
('TC002', 'Trợ cấp hộ nghèo', 'Hỗ trợ sinh hoạt phí cho hộ nghèo', 'Hộ nghèo', 350000, '2024-01-01', '2024-12-31', 'active', 1),
('TC003', 'Trợ cấp trẻ mồ côi', 'Nuôi dưỡng trẻ em mồ côi dưới 16 tuổi', 'Trẻ em', 600000, '2024-01-01', '2024-12-31', 'active', 1),
('TC004', 'Trợ cấp thiên tai', 'Hỗ trợ khẩn cấp cho hộ gia đình bị ảnh hưởng bởi thiên tai', 'Thiên tai', 1000000, '2024-01-01', '2024-12-31', 'active', 1),
('TC005', 'Trợ cấp người cao tuổi', 'Hỗ trợ hàng tháng cho người cao tuổi từ 80 tuổi trở lên', 'Người cao tuổi', 500000, '2024-01-01', '2024-12-31', 'active', 1);

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
