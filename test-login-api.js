import fetch from 'node-fetch';

console.log('=== TEST LOGIN API ===\n');

// Test 1: officer@langson.gov.vn
console.log('1. Test login officer@langson.gov.vn...');
try {
  const response1 = await fetch('http://localhost:3001/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'officer@langson.gov.vn',
      password: '123456'
    })
  });
  
  const data1 = await response1.json();
  console.log('   Status:', response1.status);
  console.log('   Response:', data1);
  
  if (data1.success) {
    console.log('   ✓ ĐĂNG NHẬP THÀNH CÔNG!');
    console.log('     User:', data1.user.full_name);
    console.log('     Role:', data1.user.role);
  } else {
    console.log('   ✗ ĐĂNG NHẬP THẤT BẠI!');
  }
} catch (error) {
  console.log('   ✗ LỖI:', error.message);
}

console.log('\n2. Test login admin@langson.gov.vn...');
try {
  const response2 = await fetch('http://localhost:3001/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@langson.gov.vn',
      password: '123456'
    })
  });
  
  const data2 = await response2.json();
  console.log('   Status:', response2.status);
  console.log('   Response:', data2);
  
  if (data2.success) {
    console.log('   ✓ ĐĂNG NHẬP THÀNH CÔNG!');
    console.log('     User:', data2.user.full_name);
    console.log('     Role:', data2.user.role);
  } else {
    console.log('   ✗ ĐĂNG NHẬP THẤT BẠI!');
  }
} catch (error) {
  console.log('   ✗ LỖI:', error.message);
}

process.exit(0);
