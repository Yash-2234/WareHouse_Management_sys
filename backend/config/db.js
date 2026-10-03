const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wms_db';
    console.log(`Connecting to MongoDB at ${connStr}...`);
    
    // Attempt standard connection with 3-second timeout
    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] MongoDB Connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[Database] Local MongoDB connection failed (${err.message}). Starting MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`[Database] In-Memory MongoDB Started & Connected: ${mongoUri}`);
    } catch (memErr) {
      console.error(`[Database Error] Could not initialize fallback database: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
