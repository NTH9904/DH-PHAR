const mongoose = require('mongoose');
const Product = require('../backend/models/Product');
require('dotenv').config();

async function updateProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dh-pharmacy');
        console.log('✅ Connected to MongoDB\n');

        // Update products with diseases and age groups
        const updates = [
            {
                name: /paracetamol|acetaminophen/i,
                data: {
                    diseases: ['sốt', 'đau đầu', 'cảm cúm', 'đau nhức'],
                    symptoms: ['sốt', 'đau đầu', 'đau nhức cơ'],
                    ageGroup: { min: 6, max: null, description: 'Trẻ em từ 6 tuổi và người lớn' }
                }
            },
            {
                name: /amoxicillin/i,
                data: {
                    diseases: ['viêm họng', 'viêm phổi', 'nhiễm trùng'],
                    symptoms: ['đau họng', 'ho', 'sốt'],
                    ageGroup: { min: 12, max: null, description: 'Người lớn và trẻ em trên 12 tuổi' }
                }
            },
            {
                name: /vitamin c/i,
                data: {
                    diseases: ['thiếu vitamin', 'suy giảm miễn dịch'],
                    symptoms: ['mệt mỏi', 'dễ ốm'],
                    ageGroup: { min: 0, max: null, description: 'Mọi lứa tuổi' }
                }
            },
            {
                name: /thuốc ho/i,
                data: {
                    diseases: ['ho', 'viêm phế quản', 'cảm cúm'],
                    symptoms: ['ho', 'đau họng', 'khó thở'],
                    ageGroup: { min: 2, max: null, description: 'Trẻ em từ 2 tuổi và người lớn' }
                }
            },
            {
                name: /thuốc dị ứng|cetirizine|loratadine/i,
                data: {
                    diseases: ['dị ứng', 'viêm mũi dị ứng', 'mày đay'],
                    symptoms: ['ngứa', 'sổ mũi', 'hắt hơi', 'nổi mẩn'],
                    ageGroup: { min: 6, max: null, description: 'Trẻ em từ 6 tuổi và người lớn' }
                }
            }
        ];

        let updated = 0;

        for (const update of updates) {
            const result = await Product.updateMany(
                { name: update.name },
                { $set: update.data }
            );
            
            if (result.modifiedCount > 0) {
                console.log(`✅ Updated ${result.modifiedCount} products matching: ${update.name}`);
                updated += result.modifiedCount;
            }
        }

        console.log(`\n📊 Total updated: ${updated} products`);
        console.log('\n✨ Done!');
        
        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

updateProducts();
