require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('public/uploads'));

// Database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/webappfood';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ Mongoose connection failed. Error:', err.message));

<<<<<<< Updated upstream
=======
// Routes
const adminRoutes = require('./routes/adminRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
app.use('/api/admin', adminRoutes);
app.use('/api/merchant', merchantRoutes);

>>>>>>> Stashed changes
// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to WEB_APPFOOD API',
    db_status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
