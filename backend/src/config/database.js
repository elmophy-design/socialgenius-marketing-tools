// backend/src/config/database.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI not set - using in-memory storage');
      return null;
    }

    // Only include options that are currently respected by the driver.
    // Removed `useNewUrlParser` and `useUnifiedTopology` because they are deprecated.
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // you can add other valid mongoose options here if needed, for example:
      // retryWrites: true,
      // w: 'majority'
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown
    const gracefulClose = async () => {
      try {
        await mongoose.connection.close(false); // do not force close in-flight ops
        console.log('🔒 MongoDB connection closed through app termination');
      } catch (e) {
        console.error('❌ Error closing MongoDB connection:', e);
      } finally {
        process.exit(0);
      }
    };

    // Make sure we don't attach duplicate handlers if connectDB gets called multiple times
    if (!process.listeners('SIGINT').some((h) => h.name === 'gracefulClose')) {
      process.on('SIGINT', gracefulClose);
    }

    return conn;
  } catch (error) {
    // prefer logging full error object during dev; keep message in prod
    console.error('❌ Database connection error:', error);
    console.warn('⚠️  Continuing with in-memory storage');
    return null;
  }
};

export default connectDB;
