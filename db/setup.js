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
    
    const db = new Database(dbPath);
    
    console.log('📋 Creating schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    db.exec(schemaSQL);
    console.log('✅ Schema created successfully');

    console.log('🌱 Seeding initial data...');
    const seedsSQL = fs.readFileSync(path.join(__dirname, 'seeds.sql'), 'utf8');
    db.exec(seedsSQL);
    console.log('✅ Seeds planted successfully');

    console.log('\n🎉 Database setup complete!');
    console.log('\n📝 Default users:');
    console.log('   • citizen@example.com (CITIZEN) - password: 123456');
    console.log('   • officer@langson.gov.vn (OFFICER) - password: 123456');
    console.log('   • admin@langson.gov.vn (ADMIN) - password: 123456');
    
    db.close();
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
