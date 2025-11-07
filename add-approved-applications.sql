-- Thêm hồ sơ mẫu đã duyệt để test tạo đợt chi trả

-- Cập nhật một số hồ sơ hiện tại thành approved
UPDATE applications 
SET status = 'approved', 
    approved_amount = support_amount,
    approved_at = datetime('now')
WHERE id IN (
    SELECT id FROM applications 
    WHERE status IN ('pending', 'under_review')
    LIMIT 5
);

-- Nếu không có hồ sơ nào, tạo mới
INSERT OR IGNORE INTO applications (
    code, user_id, program_id, citizen_id, full_name, date_of_birth, gender, 
    phone, email, address, district, commune, village, 
    application_type, support_amount, approved_amount, status, 
    submitted_at, approved_at
) VALUES 
('APP00101', 1, 1, '001098123456', 'Nguyễn Văn An', '1990-01-15', 'Nam', 
 '0912345001', 'nguyenvanan@example.com', 'Thôn 1, Xã Hoàng Đồng, Lạng Sơn', 
 'Cao Lộc', 'Hoàng Đồng', 'Thôn 1', 'Người khuyết tật', 
 540000, 540000, 'approved', datetime('now'), datetime('now')),

('APP00102', 2, 2, '001098234567', 'Trần Thị Bình', '1985-05-20', 'Nữ', 
 '0912345002', 'tranthbinh@example.com', 'Thôn 2, Xã Hoàng Đồng, Lạng Sơn', 
 'Cao Lộc', 'Hoàng Đồng', 'Thôn 2', 'Hộ nghèo', 
 350000, 350000, 'approved', datetime('now'), datetime('now')),

('APP00103', 3, 3, '001098345678', 'Lê Văn Cường', '2010-03-12', 'Nam', 
 '0912345003', 'levancuong@example.com', 'Thôn 3, Xã Tân Phú, Lạng Sơn', 
 'Văn Lãng', 'Tân Phú', 'Thôn 3', 'Trẻ mồ côi', 
 600000, 600000, 'approved', datetime('now'), datetime('now')),

('APP00104', 4, 5, '001098456789', 'Phạm Thị Dung', '1940-08-25', 'Nữ', 
 '0912345004', 'phamthidung@example.com', 'Thôn 4, Xã Hoàng Văn Thụ, Lạng Sơn', 
 'Cao Lộc', 'Hoàng Văn Thụ', 'Thôn 4', 'Người cao tuổi', 
 500000, 500000, 'approved', datetime('now'), datetime('now')),

('APP00105', 5, 1, '001098567890', 'Hoàng Văn Em', '1995-11-30', 'Nam', 
 '0912345005', 'hoangvanem@example.com', 'Thôn 5, Xã Bắc Sơn, Lạng Sơn', 
 'Bắc Sơn', 'Bắc Sơn', 'Thôn 5', 'Người khuyết tật', 
 540000, 540000, 'approved', datetime('now'), datetime('now'));

-- Hiển thị số lượng hồ sơ đã duyệt
SELECT COUNT(*) as total_approved FROM applications WHERE status = 'approved';
