import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../database.sqlite');

function setupDatabase() {
  try {
    console.log('🔧 Setting up SQLite database...');
    console.log('📍 Database location:', dbPath);

    // If existing DB may cause FK issues, back it up and recreate fresh
    if (fs.existsSync(dbPath)) {
      const backupPath = dbPath.replace(/\.sqlite$/i, `.backup-${Date.now()}.sqlite`);
      fs.copyFileSync(dbPath, backupPath);
      fs.unlinkSync(dbPath);
      console.log('🗄️  Existing database backed up to:', backupPath);
    }

    const db = new Database(dbPath);
    
    console.log('📋 Creating schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    db.exec(schemaSQL);
    console.log('✅ Schema created successfully');

  console.log('🌱 Seeding initial data...');
  const seedsSQL = fs.readFileSync(path.join(__dirname, 'seeds.sql'), 'utf8');
  // Disable FK checks during seeding to avoid transient constraint issues
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec(seedsSQL);
  db.exec('PRAGMA foreign_keys = ON;');
    console.log('✅ Seeds planted successfully');

    // ============================================
    // KIỂM TRA DATABASE SAU KHI SEED
    // ============================================
    console.log('\n🔍 Verifying database...\n');

    // 1. Kiểm tra các bảng đã tạo
    console.log('📊 Checking tables...');
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all();
    console.log(`   ✅ Found ${tables.length} tables:`, tables.map(t => t.name).join(', '));

    // 2. Kiểm tra số lượng users theo role
    console.log('\n� User accounts:');
    const userStats = db.prepare(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `).all();
    
    let totalUsers = 0;
    userStats.forEach(stat => {
      totalUsers += stat.count;
      const icon = stat.role === 'CITIZEN' ? '👤' : stat.role === 'OFFICER' ? '👨‍💼' : '🔑';
      console.log(`   ${icon} ${stat.role}: ${stat.count}`);
    });
    console.log(`   📊 Total users: ${totalUsers}`);

    // 3. Kiểm tra một vài tài khoản mẫu
    console.log('\n🔐 Sample accounts verification:');
    
    // Kiểm tra citizen
    const citizen = db.prepare(`
      SELECT full_name, citizen_id, email, role 
      FROM users 
      WHERE role = 'CITIZEN' 
      LIMIT 1
    `).get();
    if (citizen) {
      console.log(`   ✅ Citizen: ${citizen.full_name} (CCCD: ${citizen.citizen_id})`);
    }

    // Kiểm tra officer
    const officer = db.prepare(`
      SELECT full_name, citizen_id, email, role 
      FROM users 
      WHERE role = 'OFFICER' 
      LIMIT 1
    `).get();
    if (officer) {
      console.log(`   ✅ Officer: ${officer.full_name} (${officer.email})`);
    }

    // Kiểm tra admin
    const admin = db.prepare(`
      SELECT full_name, citizen_id, email, role 
      FROM users 
      WHERE role = 'ADMIN' 
      LIMIT 1
    `).get();
    if (admin) {
      console.log(`   ✅ Admin: ${admin.full_name} (${admin.email})`);
    }

    // 4. Kiểm tra chương trình hỗ trợ
    console.log('\n💰 Support programs:');
    const programs = db.prepare(`
      SELECT code, name, amount, status 
      FROM support_programs 
      WHERE status = 'active'
    `).all();
    console.log(`   ✅ Found ${programs.length} active programs:`);
    programs.forEach(p => {
      console.log(`      • ${p.code}: ${p.name} (${p.amount.toLocaleString('vi-VN')} VNĐ)`);
    });

    // 5. Kiểm tra ràng buộc CCCD
    console.log('\n🔢 CCCD format check:');
    const invalidCCCD = db.prepare(`
      SELECT full_name, citizen_id 
      FROM users 
      WHERE LENGTH(citizen_id) != 12 
      OR citizen_id NOT GLOB '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
    `).all();
    
    if (invalidCCCD.length > 0) {
      console.log(`   ⚠️  Found ${invalidCCCD.length} invalid CCCD:`);
      invalidCCCD.forEach(u => {
        console.log(`      • ${u.full_name}: ${u.citizen_id}`);
      });
    } else {
      console.log('   ✅ All CCCD numbers are valid (12 digits)');
    }

    // 6. Kiểm tra Foreign Keys
    console.log('\n🔗 Foreign key integrity:');
    const fkCheck = db.pragma('foreign_key_check');
    if (fkCheck.length === 0) {
      console.log('   ✅ All foreign key constraints are valid');
    } else {
      console.log('   ⚠️  Foreign key violations found:', fkCheck);
    }

    // 7. Tổng kết
    console.log('\n' + '='.repeat(50));
    console.log('🎉 DATABASE SETUP COMPLETE!');
    console.log('='.repeat(50));
    
    console.log('\n📝 Quick start guide:');
    console.log('\n1️⃣  Citizen accounts (login with CCCD):');
    const sampleCitizens = db.prepare(`
      SELECT citizen_id, full_name 
      FROM users 
      WHERE role = 'CITIZEN' 
      LIMIT 3
    `).all();
    sampleCitizens.forEach(c => {
      console.log(`   • CCCD: ${c.citizen_id} - ${c.full_name}`);
    });
    console.log('   • Password: 123456');

    console.log('\n2️⃣  Officer accounts (login with Email or CCCD):');
    const officers = db.prepare(`
      SELECT email, citizen_id, full_name 
      FROM users 
      WHERE role = 'OFFICER'
    `).all();
    officers.forEach(o => {
      console.log(`   • Email: ${o.email} | CCCD: ${o.citizen_id}`);
    });
    console.log('   • Password: 123456');

    console.log('\n3️⃣  Admin account (login with Email or CCCD):');
    const admins = db.prepare(`
      SELECT email, citizen_id, full_name 
      FROM users 
      WHERE role = 'ADMIN'
    `).all();
    admins.forEach(a => {
      console.log(`   • Email: ${a.email} | CCCD: ${a.citizen_id}`);
    });
    console.log('   • Password: 123456');

    console.log('\n🚀 Start the application:');
    console.log('   • Backend: npm run backend');
    console.log('   • Frontend: npm run dev');
    console.log('\n📖 Full account list: See ACCOUNTS.md\n');
    
    db.close();
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
