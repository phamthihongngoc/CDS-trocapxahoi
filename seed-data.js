import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('🌱 Bắt đầu seed dữ liệu mẫu...\n');

// Clear existing data (optional - comment out if you want to keep old data)
console.log('🗑️  Xóa dữ liệu cũ...');
const tables = [
  'complaint_responses', 'complaints', 'notifications', 
  'user_activity_log', 'payout_items', 'payouts',
  'application_documents', 'application_history', 'applications',
  'household_members', 'households', 'support_programs', 'users'
];

tables.forEach(table => {
  try {
    db.exec(`DELETE FROM ${table}`);
  } catch (err) {
    // Table might not exist, skip it
  }
});
console.log('  ✓ Đã xóa dữ liệu cũ\n');

// Helper function to insert data
function insertData(table, data) {
  const columns = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map(() => '?').join(', ');
  const values = Object.values(data);
  
  const stmt = db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`);
  return stmt.run(...values).lastInsertRowid;
}

// 1. Seed Users
console.log('👥 Tạo users...');
const hashedPassword = bcrypt.hashSync('123456', 10);

const users = [
  // Citizens with CCCD
  { full_name: 'Nguyễn Văn An', citizen_id: '001098123456', email: 'nguyenvanan@example.com', phone: '0901234567', address: 'Thôn 1, Xã Hoàng Đồng, Lạng Sơn', password_hash: hashedPassword, role: 'CITIZEN', status: 'active' },
  { full_name: 'Trần Thị Bình', citizen_id: '001098234567', email: 'tranthbinh@example.com', phone: '0902234567', address: 'Thôn 2, Xã Hoàng Đồng, Lạng Sơn', password_hash: hashedPassword, role: 'CITIZEN', status: 'active' },
  { full_name: 'Lê Văn Cường', citizen_id: '001098345678', email: 'levancuong@example.com', phone: '0903234567', address: 'Thôn 3, Xã Tân Phú, Lạng Sơn', password_hash: hashedPassword, role: 'CITIZEN', status: 'active' },
  { full_name: 'Phạm Thị Dung', citizen_id: '001098456789', email: 'phamthidung@example.com', phone: '0904234567', address: 'Thôn 1, Xã Tân Phú, Lạng Sơn', password_hash: hashedPassword, role: 'CITIZEN', status: 'active' },
  { full_name: 'Hoàng Văn Em', citizen_id: '001098567890', email: 'hoangvanem@example.com', phone: '0905234567', address: 'Thôn 4, Xã Hoàng Đồng, Lạng Sơn', password_hash: hashedPassword, role: 'CITIZEN', status: 'active' },
  
  // Officers with CCCD
  { full_name: 'Trần Văn Xuân', citizen_id: '025088123456', email: 'officer1@langson.gov.vn', phone: '0911234567', address: 'UBND Xã Hoàng Đồng, Lạng Sơn', password_hash: hashedPassword, role: 'OFFICER', status: 'active' },
  { full_name: 'Nguyễn Thị Yến', citizen_id: '025088234567', email: 'officer2@langson.gov.vn', phone: '0912234567', address: 'UBND Xã Tân Phú, Lạng Sơn', password_hash: hashedPassword, role: 'OFFICER', status: 'active' },
  
  // Admin with CCCD
  { full_name: 'Hoàng Văn Tài', citizen_id: '035099123456', email: 'admin@langson.gov.vn', phone: '0920234567', address: 'UBND Tỉnh Lạng Sơn', password_hash: hashedPassword, role: 'ADMIN', status: 'active' },
];

const userIds = [];
users.forEach(user => {
  const id = insertData('users', user);
  userIds.push(id);
  console.log(`  ✓ Tạo user: ${user.full_name} (${user.role})`);
});

// 2. Seed Support Programs
console.log('\n📋 Tạo chương trình hỗ trợ...');
const programs = [
  { code: 'TC001', name: 'Trợ cấp người khuyết tật', description: 'Hỗ trợ sinh hoạt phí cho người khuyết tật', type: 'Khuyết tật', amount: 540000, start_date: '2024-01-01', end_date: '2024-12-31', status: 'active', created_by: userIds[7] },
  { code: 'TC002', name: 'Trợ cấp hộ nghèo', description: 'Hỗ trợ sinh hoạt phí cho hộ nghèo', type: 'Hộ nghèo', amount: 350000, start_date: '2024-01-01', end_date: '2024-12-31', status: 'active', created_by: userIds[7] },
  { code: 'TC003', name: 'Trợ cấp trẻ mồ côi', description: 'Nuôi dưỡng trẻ em mồ côi dưới 16 tuổi', type: 'Trẻ em', amount: 600000, start_date: '2024-01-01', end_date: '2024-12-31', status: 'active', created_by: userIds[7] },
  { code: 'TC004', name: 'Hỗ trợ người cao tuổi', description: 'Trợ cấp cho người trên 80 tuổi', type: 'Người cao tuổi', amount: 450000, start_date: '2024-01-01', end_date: '2024-12-31', status: 'active', created_by: userIds[7] },
  { code: 'TC005', name: 'Hỗ trợ học sinh nghèo', description: 'Học bổng cho học sinh nghèo vượt khó', type: 'Giáo dục', amount: 500000, start_date: '2024-09-01', end_date: '2025-06-30', status: 'active', created_by: userIds[7] },
];

const programIds = [];
programs.forEach(program => {
  const id = insertData('support_programs', program);
  programIds.push(id);
  console.log(`  ✓ Tạo chương trình: ${program.name}`);
});

// 3. Seed Applications
console.log('\n📝 Tạo hồ sơ xin hỗ trợ...');
const applications = [
  { code: 'APP00001', user_id: userIds[0], program_id: programIds[0], citizen_id: '001098123456', full_name: 'Nguyễn Văn An', date_of_birth: '1985-03-15', gender: 'Nam', phone: '0901234567', email: 'nguyenvanan@example.com', address: 'Thôn 1, Xã Hoàng Đồng', district: 'Lạng Sơn', commune: 'Hoàng Đồng', village: 'Thôn 1', household_members_data: JSON.stringify([{name: 'Nguyễn Văn An', relationship: 'Chủ hộ', yearOfBirth: 1985}]), application_type: 'Người khuyết tật', support_amount: 540000, status: 'approved', submitted_at: '2024-11-15', approved_at: '2024-11-20', notes: 'Đã xác minh' },
  
  { code: 'APP00002', user_id: userIds[1], program_id: programIds[1], citizen_id: '001098234567', full_name: 'Trần Thị Bình', date_of_birth: '1990-07-20', gender: 'Nữ', phone: '0902234567', email: 'tranthbinh@example.com', address: 'Thôn 2, Xã Hoàng Đồng', district: 'Lạng Sơn', commune: 'Hoàng Đồng', village: 'Thôn 2', household_members_data: JSON.stringify([{name: 'Trần Thị Bình', relationship: 'Chủ hộ', yearOfBirth: 1990}, {name: 'Trần Văn F', relationship: 'Con', yearOfBirth: 2015}]), application_type: 'Hộ nghèo', support_amount: 350000, status: 'approved', submitted_at: '2024-11-10', approved_at: '2024-11-18', notes: 'Hộ nghèo cận nghèo' },
  
  { code: 'APP00003', user_id: userIds[2], program_id: programIds[2], citizen_id: '001098345678', full_name: 'Lê Văn Cường', date_of_birth: '1995-01-10', gender: 'Nam', phone: '0903234567', email: 'levancuong@example.com', address: 'Thôn 3, Xã Tân Phú', district: 'Lạng Sơn', commune: 'Tân Phú', village: 'Thôn 3', household_members_data: JSON.stringify([{name: 'Lê Thị G', relationship: 'Con', yearOfBirth: 2010}]), application_type: 'Trẻ mồ côi', support_amount: 600000, status: 'under_review', submitted_at: '2024-12-01', reviewed_at: '2024-12-05', notes: 'Đang xác minh giấy tờ' },
  
  { code: 'APP00004', user_id: userIds[3], program_id: programIds[3], citizen_id: '001098456789', full_name: 'Phạm Thị Dung', date_of_birth: '1940-05-15', gender: 'Nữ', phone: '0904234567', email: 'phamthidung@example.com', address: 'Thôn 1, Xã Tân Phú', district: 'Lạng Sơn', commune: 'Tân Phú', village: 'Thôn 1', household_members_data: JSON.stringify([{name: 'Phạm Thị Dung', relationship: 'Chủ hộ', yearOfBirth: 1940}]), application_type: 'Người cao tuổi', support_amount: 450000, status: 'approved', submitted_at: '2024-10-01', approved_at: '2024-10-10', notes: 'Người cao tuổi đơn thân' },
  
  { code: 'APP00005', user_id: userIds[4], program_id: programIds[4], citizen_id: '001098567890', full_name: 'Hoàng Văn Em', date_of_birth: '1988-11-25', gender: 'Nam', phone: '0905234567', email: 'hoangvanem@example.com', address: 'Thôn 4, Xã Hoàng Đồng', district: 'Lạng Sơn', commune: 'Hoàng Đồng', village: 'Thôn 4', household_members_data: JSON.stringify([{name: 'Hoàng Văn H', relationship: 'Con', yearOfBirth: 2012}]), application_type: 'Học sinh nghèo', support_amount: 500000, status: 'pending', submitted_at: '2024-12-08', notes: 'Mới nộp hồ sơ' },
  
  { code: 'APP00006', user_id: userIds[0], program_id: programIds[1], citizen_id: '001098123456', full_name: 'Nguyễn Văn An', date_of_birth: '1985-03-15', gender: 'Nam', phone: '0901234567', email: 'nguyenvanan@example.com', address: 'Thôn 1, Xã Hoàng Đồng', district: 'Lạng Sơn', commune: 'Hoàng Đồng', village: 'Thôn 1', household_members_data: JSON.stringify([{name: 'Nguyễn Văn An', relationship: 'Chủ hộ', yearOfBirth: 1985}]), application_type: 'Hộ nghèo', support_amount: 350000, status: 'rejected', submitted_at: '2024-09-01', rejected_at: '2024-09-10', rejection_reason: 'Không đủ điều kiện theo quy định', notes: 'Thu nhập vượt ngưỡng nghèo' },
];

const applicationIds = [];
applications.forEach(app => {
  const id = insertData('applications', app);
  applicationIds.push(id);
  console.log(`  ✓ Tạo hồ sơ: ${app.code} - ${app.full_name} (${app.status})`);
});

// 4. Seed Application History
console.log('\n📜 Tạo lịch sử hồ sơ...');
const histories = [
  { application_id: applicationIds[0], action: 'Tạo hồ sơ', new_status: 'pending', performed_by: userIds[0], comment: 'Nộp hồ sơ xin trợ cấp' },
  { application_id: applicationIds[0], action: 'Duyệt hồ sơ', old_status: 'pending', new_status: 'approved', performed_by: userIds[5], comment: 'Đủ điều kiện, phê duyệt' },
  
  { application_id: applicationIds[1], action: 'Tạo hồ sơ', new_status: 'pending', performed_by: userIds[1], comment: 'Nộp hồ sơ xin trợ cấp' },
  { application_id: applicationIds[1], action: 'Duyệt hồ sơ', old_status: 'pending', new_status: 'approved', performed_by: userIds[5], comment: 'Xác nhận hộ nghèo' },
  
  { application_id: applicationIds[2], action: 'Tạo hồ sơ', new_status: 'pending', performed_by: userIds[2], comment: 'Nộp hồ sơ xin trợ cấp' },
  { application_id: applicationIds[2], action: 'Xem xét', old_status: 'pending', new_status: 'under_review', performed_by: userIds[6], comment: 'Đang xác minh thông tin' },
  
  { application_id: applicationIds[5], action: 'Tạo hồ sơ', new_status: 'pending', performed_by: userIds[0], comment: 'Nộp hồ sơ xin trợ cấp' },
  { application_id: applicationIds[5], action: 'Từ chối', old_status: 'pending', new_status: 'rejected', performed_by: userIds[5], comment: 'Không đủ điều kiện' },
];

histories.forEach(history => {
  insertData('application_history', history);
});
console.log(`  ✓ Tạo ${histories.length} bản ghi lịch sử`);

// 5. Seed Payouts
console.log('\n💰 Tạo đợt chi trả...');
const payouts = [
  { batch_code: 'BATCH001', period: '11/2024', total_amount: 890000, total_recipients: 2, status: 'completed', created_by: userIds[5], program_id: programIds[0], disbursed_at: '2024-11-25' },
  { batch_code: 'BATCH002', period: '12/2024', total_amount: 1050000, total_recipients: 2, status: 'pending', created_by: userIds[6], program_id: programIds[2] },
];

const payoutIds = [];
payouts.forEach(payout => {
  const id = insertData('payouts', payout);
  payoutIds.push(id);
  console.log(`  ✓ Tạo đợt chi trả: ${payout.batch_code} - ${payout.status}`);
});

// 6. Seed Payout Items
console.log('\n💵 Tạo chi tiết chi trả...');
const payoutItems = [
  { payout_id: payoutIds[0], application_id: applicationIds[0], amount: 540000, status: 'paid', beneficiary_name: 'Nguyễn Văn A', citizen_id: '123456789001', payment_method: 'bank_transfer', paid_at: '2024-11-25' },
  { payout_id: payoutIds[0], application_id: applicationIds[1], amount: 350000, status: 'paid', beneficiary_name: 'Trần Thị B', citizen_id: '123456789002', payment_method: 'cash', paid_at: '2024-11-25' },
  
  { payout_id: payoutIds[1], application_id: applicationIds[2], amount: 600000, status: 'pending', beneficiary_name: 'Lê Văn C', citizen_id: '123456789003' },
  { payout_id: payoutIds[1], application_id: applicationIds[3], amount: 450000, status: 'pending', beneficiary_name: 'Phạm Thị D', citizen_id: '123456789004' },
];

payoutItems.forEach(item => {
  insertData('payout_items', item);
});
console.log(`  ✓ Tạo ${payoutItems.length} mục chi trả`);

// 7. Seed Notifications
console.log('\n🔔 Tạo thông báo...');
const notifications = [
  { user_id: userIds[0], title: 'Hồ sơ được phê duyệt', message: 'Hồ sơ APP00001 của bạn đã được phê duyệt', type: 'application_approved', is_read: 1 },
  { user_id: userIds[0], title: 'Khiếu nại được giải quyết', message: 'Khiếu nại của bạn đã được giải quyết', type: 'complaint_resolved', is_read: 1 },
  { user_id: userIds[1], title: 'Hồ sơ được phê duyệt', message: 'Hồ sơ APP00002 của bạn đã được phê duyệt', type: 'application_approved', is_read: 0 },
  { user_id: userIds[2], title: 'Hồ sơ đang xem xét', message: 'Hồ sơ APP00003 đang được xem xét', type: 'application_updated', is_read: 0 },
  { user_id: userIds[4], title: 'Hồ sơ đã tiếp nhận', message: 'Hồ sơ APP00005 đã được tiếp nhận', type: 'application_received', is_read: 0 },
];

notifications.forEach(notif => {
  insertData('notifications', notif);
});
console.log(`  ✓ Tạo ${notifications.length} thông báo`);

console.log('\n✅ Hoàn tất seed dữ liệu!\n');
console.log('📈 Tổng kết:');
console.log(`  - ${users.length} users`);
console.log(`  - ${programs.length} chương trình hỗ trợ`);
console.log(`  - ${applications.length} hồ sơ`);
console.log(`  - ${payouts.length} đợt chi trả`);
console.log(`  - ${notifications.length} thông báo`);
console.log('\n🎉 Dữ liệu mẫu đã sẵn sàng để test!');

db.close();
