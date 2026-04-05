const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/webappfood')
  .then(async () => {
    console.log('Connected to DB');
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    console.log('Users in DB:');
    users.forEach(user => {
        console.log(`- Email: ${user.email}, Role: ${user.role}`);
    });
    console.log(`Total users: ${users.length}`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to DB:', err);
    process.exit(1);
  });
