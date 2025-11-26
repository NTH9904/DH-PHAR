const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

async function testUpload() {
  console.log('🧪 Testing Image Upload\n');

  // Step 1: Login
  console.log('1️⃣  Logging in...');
  const loginData = JSON.stringify({
    email: 'admin@dhpharmacy.com',
    password: 'admin123'
  });

  const token = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const response = JSON.parse(data);
        if (response.success) {
          console.log('   ✅ Login successful\n');
          resolve(response.token);
        } else {
          reject(new Error('Login failed'));
        }
      });
    });
    req.on('error', reject);
    req.write(loginData);
    req.end();
  });

  // Step 2: Create a test image
  console.log('2️⃣  Creating test image...');
  const testImagePath = path.join(__dirname, 'test-image.png');
  
  // Create a simple PNG image (1x1 pixel)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
  ]);
  
  fs.writeFileSync(testImagePath, pngData);
  console.log('   ✅ Test image created\n');

  // Step 3: Upload image
  console.log('3️⃣  Uploading image...');
  
  const form = new FormData();
  form.append('image', fs.createReadStream(testImagePath));

  const uploadResult = await new Promise((resolve, reject) => {
    form.submit({
      host: 'localhost',
      port: 3000,
      path: '/api/upload/product',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (err, res) => {
      if (err) return reject(err);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  if (uploadResult.success) {
    console.log('   ✅ Upload successful');
    console.log('   URL:', uploadResult.data.url);
    console.log('   Filename:', uploadResult.data.filename);
    console.log('   Size:', uploadResult.data.size, 'bytes\n');
  } else {
    console.log('   ❌ Upload failed:', uploadResult.message);
  }

  // Cleanup
  fs.unlinkSync(testImagePath);
  console.log('4️⃣  Cleanup completed\n');

  console.log('========================================');
  console.log('🎉 Upload test completed!');
  console.log('========================================');
}

testUpload().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});
