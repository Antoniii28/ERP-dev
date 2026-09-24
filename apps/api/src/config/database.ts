import mongoose from 'mongoose';

import { env } from './env.js';

export const connectDatabase = async (): Promise<void> => {
  if (!env.MONGODB_URI) {
    if (env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is required in production.');
    }

    console.warn('MONGODB_URI is not configured. Database connection skipped.');
    return;
  }

  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10_000,
    });

    console.log('MongoDB Atlas connected successfully.');
  } catch (error) {
    console.error('MongoDB connection failed. Verify MONGODB_URI, Atlas Network Access, and database user credentials.');
    throw error;
  }
};

export const getDatabaseStatus = (): 'connected' | 'connecting' | 'disconnected' | 'disconnecting' => {
  switch (mongoose.connection.readyState) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'disconnected';
  }
};
