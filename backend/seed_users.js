const mongoose = require('mongoose');
const bcrypt    = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/webappfood').then(async () => {
  console.log('Connected');

  const salt   = await bcrypt.genSalt(10);
  const hash   = await bcrypt.hash('123456', salt);
  const db     = mongoose.connection.db;

  // Upsert merchant user
  const result = await db.collection('users').findOneAndUpdate(
    { email: 'merchant@webfood.com' },
    { $set: { firstName: 'Merchant', lastName: 'Test', email: 'merchant@webfood.com', password: hash, role: 'Merchant', phoneNumber: '0987654322' } },
    { upsert: true, returnDocument: 'after' }
  );

  const userId = result._id;

  // Upsert restaurant linked to this merchant
  await db.collection('restaurants').updateOne(
    { ownerId: userId },
    { $set: {
        ownerId: userId,
        name: 'Quán Test của Bảo',
        address: '123 Lý Thường Kiệt, Q.10, TP.HCM',
        description: 'Quán ăn ngon bổ rẻ',
        image: '',
        openingHours: '08:00 - 22:00',
        status: 'approved'
    }},
    { upsert: true }
  );

  console.log('✅ Merchant + Restaurant seeded!');
  console.log('   Email: merchant@webfood.com | Password: 123456');
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
