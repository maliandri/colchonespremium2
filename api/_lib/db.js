import mongoose from 'mongoose';

let cachedConnection = null;

export async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.DB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      retryReads: true,
      bufferCommands: false,
    });

    cachedConnection = conn;
    console.log('✅ MongoDB connected');
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}