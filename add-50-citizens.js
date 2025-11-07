import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Temporarily disable foreign keys
db.pragma('foreign_keys = OFF');

// Generate 50 citizens with realistic Vietnamese names
const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Mai', 'Chu', 'Tô', 'Hà', 'Trương', 'Lưu', 'Đinh', 'Đoàn', 'Cao'];
const middleNames = ['Văn', 'Thị', 'Hữu', 'Minh', 'Thanh', 'Quốc', 'Đức', 'Anh', 'Thu', 'Hoàng'];
const lastNames = ['An', 'Bình', 'Cường', 'Dung', 'Em', 'Phượng', 'Giang', 'Hoa', 'Inh', 'Kim', 'Long', 'Mai', 'Nam', 'Oanh', 'Phong', 'Quỳnh', 'Sơn', 'Tuyết', 'Uy', 'Vân', 'Xuân', 'Yến', 'Zung', 'Hùng', 'Linh', 'Tuấn', 'Hương', 'Đào', 'Lan', 'Hải', 'Minh', 'Tâm', 'Nga', 'Hưng', 'Tú', 'Thảo', 'Khánh', 'Dương', 'Hoài', 'Phúc'];

const citizens = [];
for (let i = 0; i < 50; i++) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const fullName = `${firstName} ${middleName} ${lastName}`;
  
  // Generate CCCD starting from 001098000000
  const cccdNum = 1098000000 + i;
  const citizenId = cccdNum.toString().padStart(12, '0');
  
  // Generate email from name
  const emailName = `${lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}${i + 1}`;
  const email = `${emailName}@example.com`;
  
  // Generate phone
  const phone = `09${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`;
  
  citizens.push({ fullName, citizenId, email, phone });
}

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
  console.log('🌱 Bắt đầu thêm 50 người dân + 3 cán bộ + 1 admin...\n');

  const password = '123456';
  const hashedPassword = await bcrypt.hash(password, 10);

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO users (full_name, email, citizen_id, phone, password_hash, role, status)
    VALUES (?, ?, ?, ?, ?, ?, 'active')
  `);

  // Add admin first (to avoid foreign key issues)
  console.log('🔑 Thêm admin trước...');
  let adminCount = 0;
  try {
    const info = insertStmt.run(
      admin.full_name,
      admin.email,
      admin.citizen_id,
      admin.phone,
      hashedPassword,
      admin.role
    );
    if (info.changes > 0) {
      adminCount++;
      console.log(`  ✓ ${admin.full_name} (${admin.email})`);
    }
  } catch (error) {
    console.log(`  ✗ Lỗi thêm admin: ${error.message}`);
  }

  // Add officers
  // Add officers
  console.log('\n👨‍💼 Thêm 3 cán bộ...');
  let officerCount = 0;
  for (const officer of officers) {
    try {
      const info = insertStmt.run(
        officer.full_name,
        officer.email,
        officer.citizen_id,
        officer.phone,
        hashedPassword,
        officer.role
      );
      if (info.changes > 0) {
        officerCount++;
        console.log(`  ✓ ${officer.full_name} (${officer.email})`);
      }
    } catch (error) {
      console.log(`  ✗ Lỗi thêm ${officer.full_name}: ${error.message}`);
    }
  }
  // Add 50 citizens
  // Add 50 citizens
  console.log('\n👥 Thêm 50 người dân...');
  let citizenCount = 0;
  for (const citizen of citizens) {
    try {
      const info = insertStmt.run(
        citizen.fullName,
        citizen.email,
        citizen.citizenId,
        citizen.phone,
        hashedPassword,
        'CITIZEN'
      );
      if (info.changes > 0) {
        citizenCount++;
        if (citizenCount <= 10 || citizenCount > 45) {
          console.log(`  ✓ ${citizenCount}. ${citizen.fullName} (${citizen.citizenId})`);
        } else if (citizenCount === 11) {
          console.log(`  ... (đang thêm thêm người dân)`);
        }
      }
    } catch (error) {
      console.log(`  ✗ Lỗi thêm ${citizen.fullName}: ${error.message}`);
    }
  }
  console.log('\n✅ Hoàn tất!');
  console.log(`\n📈 Tổng kết:`);
  console.log(`  - Admin: ${adminCount}/1 tài khoản`);
  console.log(`  - Cán bộ: ${officerCount}/3 tài khoản`);
  console.log(`  - Người dân: ${citizenCount}/50 tài khoản`);
  console.log(`  - Tổng: ${citizenCount + officerCount + adminCount} tài khoản\n`);
  console.log('🎉 Mật khẩu mặc định: 123456');
  console.log('\n📝 Ví dụ đăng nhập:');
  console.log(`  - Người dân: CCCD=${citizens[0].citizenId}, Password=123456`);
  console.log(`  - Cán bộ: Email=officer1@langson.gov.vn, Password=123456`);
  console.log(`  - Admin: Email=admin@langson.gov.vn, Password=123456`);
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
