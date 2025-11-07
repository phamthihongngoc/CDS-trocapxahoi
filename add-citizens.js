import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

const citizens = [
  { full_name: 'Nguyễn Văn An', citizen_id: '001098123456', email: 'nguyenvanan@example.com', phone: '0901234567' },
  { full_name: 'Trần Thị Bình', citizen_id: '001098234567', email: 'tranthbinh@example.com', phone: '0902345678' },
  { full_name: 'Lê Văn Cường', citizen_id: '001098345678', email: 'levancuong@example.com', phone: '0903456789' },
  { full_name: 'Phạm Thị Dung', citizen_id: '001098456789', email: 'phamthidung@example.com', phone: '0904567890' },
  { full_name: 'Hoàng Văn Em', citizen_id: '001098567890', email: 'hoangvanem@example.com', phone: '0905678901' },
  { full_name: 'Đỗ Thị Phượng', citizen_id: '001098678901', email: 'dothiphuong@example.com', phone: '0906789012' },
  { full_name: 'Vũ Văn Giang', citizen_id: '001098789012', email: 'vuvangiang@example.com', phone: '0907890123' },
  { full_name: 'Bùi Thị Hoa', citizen_id: '001098890123', email: 'buithihoa@example.com', phone: '0908901234' },
  { full_name: 'Đinh Văn Inh', citizen_id: '001098901234', email: 'dinhvaninh@example.com', phone: '0909012345' },
  { full_name: 'Ngô Thị Kim', citizen_id: '001099012345', email: 'ngothikim@example.com', phone: '0910123456' },
  { full_name: 'Phan Văn Long', citizen_id: '001099123456', email: 'phanvanlong@example.com', phone: '0911234567' },
  { full_name: 'Dương Thị Mai', citizen_id: '001099234567', email: 'duongthimai@example.com', phone: '0912345678' },
  { full_name: 'Lý Văn Nam', citizen_id: '001099345678', email: 'lyvannam@example.com', phone: '0913456789' },
  { full_name: 'Võ Thị Oanh', citizen_id: '001099456789', email: 'vothioanh@example.com', phone: '0914567890' },
  { full_name: 'Mai Văn Phong', citizen_id: '001099567890', email: 'maivanphong@example.com', phone: '0915678901' },
  { full_name: 'Chu Thị Quỳnh', citizen_id: '001099678901', email: 'chuthiquynh@example.com', phone: '0916789012' },
  { full_name: 'Tô Văn Sơn', citizen_id: '001099789012', email: 'tovanson@example.com', phone: '0917890123' },
  { full_name: 'Hà Thị Tuyết', citizen_id: '001099890123', email: 'hathituyet@example.com', phone: '0918901234' },
  { full_name: 'Trương Văn Uy', citizen_id: '001099901234', email: 'truongvanuy@example.com', phone: '0919012345' },
  { full_name: 'Lưu Thị Vân', citizen_id: '001100012345', email: 'luuthivan@example.com', phone: '0920123456' }
];

const officers = [
  { full_name: 'Trần Văn Xuân', citizen_id: '025088123456', email: 'officer1@langson.gov.vn', phone: '0931234567', role: 'OFFICER' },
  { full_name: 'Nguyễn Thị Yến', citizen_id: '025088234567', email: 'officer2@langson.gov.vn', phone: '0932345678', role: 'OFFICER' },
  { full_name: 'Phạm Văn Zung', citizen_id: '025088345678', email: 'officer3@langson.gov.vn', phone: '0933456789', role: 'OFFICER' }
];

const admin = {
  full_name: 'Hoàng Văn Tài',
  citizen_id: '035099123456',
  email: 'admin@langson.gov.vn',
  phone: '0941234567',
  role: 'ADMIN'
};

async function addUsers() {
  console.log('🌱 Bắt đầu thêm users...\n');

  const password = '123456';
  const hashedPassword = await bcrypt.hash(password, 10);

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO users (full_name, email, citizen_id, phone, password_hash, role, status, address)
    VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
  `);

  // Add citizens
  console.log('👥 Thêm người dân (20 tài khoản)...');
  let citizenCount = 0;
  for (const citizen of citizens) {
    try {
      const info = insertStmt.run(
        citizen.full_name,
        citizen.email,
        citizen.citizen_id,
        citizen.phone,
        hashedPassword,
        'CITIZEN',
        'Lạng Sơn, Việt Nam'
      );
      if (info.changes > 0) {
        citizenCount++;
        console.log(`  ✓ ${citizen.full_name} (${citizen.citizen_id})`);
      }
    } catch (error) {
      console.log(`  ✗ Lỗi thêm ${citizen.full_name}: ${error.message}`);
    }
  }

  // Add officers
  console.log('\n👨‍💼 Thêm cán bộ (3 tài khoản)...');
  let officerCount = 0;
  for (const officer of officers) {
    try {
      const info = insertStmt.run(
        officer.full_name,
        officer.email,
        officer.citizen_id,
        officer.phone,
        hashedPassword,
        officer.role,
        'Phòng Lao động - Thương binh và Xã hội, Lạng Sơn'
      );
      if (info.changes > 0) {
        officerCount++;
        console.log(`  ✓ ${officer.full_name} (${officer.email})`);
      }
    } catch (error) {
      console.log(`  ✗ Lỗi thêm ${officer.full_name}: ${error.message}`);
    }
  }

  // Add admin
  console.log('\n🔑 Thêm admin...');
  let adminCount = 0;
  try {
    const info = insertStmt.run(
      admin.full_name,
      admin.email,
      admin.citizen_id,
      admin.phone,
      hashedPassword,
      admin.role,
      'Sở Lao động - Thương binh và Xã hội, Lạng Sơn'
    );
    if (info.changes > 0) {
      adminCount++;
      console.log(`  ✓ ${admin.full_name} (${admin.email})`);
    }
  } catch (error) {
    console.log(`  ✗ Lỗi thêm admin: ${error.message}`);
  }

  console.log('\n✅ Hoàn tất!');
  console.log(`\n📈 Tổng kết:`);
  console.log(`  - Người dân: ${citizenCount} tài khoản`);
  console.log(`  - Cán bộ: ${officerCount} tài khoản`);
  console.log(`  - Admin: ${adminCount} tài khoản`);
  console.log(`  - Tổng: ${citizenCount + officerCount + adminCount} tài khoản\n`);
  console.log('🎉 Mật khẩu mặc định: 123456');
}

addUsers()
  .then(() => {
    db.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    db.close();
    process.exit(1);
  });
