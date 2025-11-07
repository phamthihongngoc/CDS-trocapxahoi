const bcrypt = require('bcryptjs');

async function testLogin() {
  const testCases = [
    { email: '025088123456', password: '123456', desc: 'CCCD cán bộ' },
    { email: 'officer1@langson.gov.vn', password: '123456', desc: 'Email cán bộ' },
    { email: '001098123456', password: '123456', desc: 'CCCD người dân' },
    { email: 'admin@langson.gov.vn', password: '123456', desc: 'Email admin' },
  ];

  console.log('🧪 TEST ĐĂNG NHẬP\n');
  console.log('='.repeat(80));

  for (const test of testCases) {
    console.log(`\n📝 Test: ${test.desc}`);
    console.log(`   Username: ${test.email}`);
    console.log(`   Password: ${test.password}`);

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: test.email, password: test.password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`   ✅ Thành công - User: ${data.user.full_name} (${data.user.role})`);
      } else {
        console.log(`   ❌ Thất bại: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ Lỗi kết nối: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ TEST HOÀN TẤT!\n');
}

testLogin();
