const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const User = require('./models/User');
const seedSystem = require('./utils/seedData');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB().then(async () => {
  // Auto Seed if Database is empty
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('[System Boot] Empty database detected. Triggering initial auto-seeding...');
    await seedSystem();
  }
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const rfidRoutes = require('./routes/rfidRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const { movementRouter, reportRouter, userRouter, activityRouter } = require('./routes/otherRoutes');

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/rfid', rfidRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/movements', movementRouter);
app.use('/api/reports', reportRouter);
app.use('/api/users', userRouter);
app.use('/api/activity', activityRouter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'RFID Warehouse Management System API',
    timestamp: new Date()
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` WMS REST API Server running on port ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(` Environment:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});
