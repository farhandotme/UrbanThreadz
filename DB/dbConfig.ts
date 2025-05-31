import mongoose from "mongoose";

let isConnecting = false;

export const connectDB = async () => {
  try {
    // If already connected, return the existing connection
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
      console.log("DB connection already in progress, waiting...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mongoose.connection;
    }

    isConnecting = true;
    console.log("Connecting to MongoDB...");

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
    });
    
    console.log("Connected to MongoDB:", conn.connection.host);
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  } finally {
    isConnecting = false;
  }
};
