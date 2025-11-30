const mongoose = require('mongoose');
require('dotenv').config();

// Connect to source database (dh_pharmacy with underscore)
const sourceUri = 'mongodb://localhost:27017/dh_pharmacy';
const targetUri = 'mongodb://localhost:27017/dh-pharmacy';

async function migrateDatabase() {
  try {
    console.log('🔄 Bắt đầu migrate database...\n');

    // Connect to source
    console.log(`📥 Kết nối đến source: ${sourceUri}`);
    const sourceConn = mongoose.createConnection(sourceUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    await new Promise((resolve, reject) => {
      sourceConn.once('open', resolve);
      sourceConn.once('error', reject);
    });
    console.log('✅ Đã kết nối source\n');

    // Connect to target
    console.log(`📤 Kết nối đến target: ${targetUri}`);
    const targetConn = mongoose.createConnection(targetUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    await new Promise((resolve, reject) => {
      targetConn.once('open', resolve);
      targetConn.once('error', reject);
    });
    console.log('✅ Đã kết nối target\n');

    // Get all collections from source
    const collections = await sourceConn.db.listCollections().toArray();
    console.log(`📦 Tìm thấy ${collections.length} collections:\n`);

    for (const collInfo of collections) {
      const collName = collInfo.name;
      console.log(`🔄 Đang copy collection: ${collName}`);

      // Get all documents from source collection
      const sourceColl = sourceConn.db.collection(collName);
      const docs = await sourceColl.find({}).toArray();
      
      if (docs.length === 0) {
        console.log(`   ⏭️  Bỏ qua (trống)\n`);
        continue;
      }

      // Drop target collection if exists
      const targetColl = targetConn.db.collection(collName);
      await targetColl.deleteMany({});

      // Insert documents to target
      await targetColl.insertMany(docs);
      console.log(`   ✅ Đã copy ${docs.length} documents\n`);
    }

    console.log('🎉 Hoàn thành migrate!\n');

    // Show statistics
    console.log('📊 Thống kê:');
    const products = await targetConn.db.collection('products').countDocuments();
    const users = await targetConn.db.collection('users').countDocuments();
    const orders = await targetConn.db.collection('orders').countDocuments();
    
    console.log(`  Products: ${products}`);
    console.log(`  Users: ${users}`);
    console.log(`  Orders: ${orders}`);

    await sourceConn.close();
    await targetConn.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

migrateDatabase();
