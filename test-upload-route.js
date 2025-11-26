const http = require('http');

console.log('🧪 Testing Upload Route\n');

// Test if upload route exists
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/upload/product',
  method: 'POST'
};

console.log('Testing:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('Method:', options.method);
console.log('');

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Status Message:', res.statusMessage);
  console.log('');

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response:', data);
    console.log('');

    if (res.statusCode === 404) {
      console.log('❌ ROUTE NOT FOUND!');
      console.log('');
      console.log('🔄 SERVER CHƯA RESTART!');
      console.log('');
      console.log('Cách fix:');
      console.log('1. Tìm terminal đang chạy server');
      console.log('2. Nhấn Ctrl+C');
      console.log('3. Chạy lại: node server.js');
      console.log('4. Chạy lại script này để test');
    } else if (res.statusCode === 401) {
      console.log('✅ ROUTE EXISTS! (401 = Unauthorized - cần token)');
      console.log('');
      console.log('Server đã restart thành công!');
      console.log('Upload route đã hoạt động!');
    } else if (res.statusCode === 400) {
      console.log('✅ ROUTE EXISTS! (400 = Bad Request - cần file)');
      console.log('');
      console.log('Server đã restart thành công!');
      console.log('Upload route đã hoạt động!');
    } else {
      console.log('⚠️  Unexpected status code:', res.statusCode);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection Error:', error.message);
  console.log('');
  console.log('Server không chạy hoặc không thể kết nối.');
  console.log('Khởi động server: node server.js');
});

req.end();
