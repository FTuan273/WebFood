const mongoose = require('mongoose');
const Restaurant = require('./src/models/Restaurant');
const User = require('./src/models/User');

mongoose.connect('mongodb://localhost:27017/webappfood').then(async () => {
  let user = await User.findOne();
  if (!user) {
    user = await User.create({ name: 'Admin', email: 'admin@test.com', password: '123', phone: '0123' });
    console.log("Created dummy user.");
  }
  
  const count = await Restaurant.countDocuments();
  console.log(`Restaurants count: ${count}`);
  if (count === 0) {
    console.log("Creating default restaurant...");
    await Restaurant.create({ ownerId: user._id, name: 'Default Store', address: '123 Test', openingHours: '08:00 - 22:00' });
    console.log("Done.");
  }
  process.exit(0);
}).catch(console.error);
