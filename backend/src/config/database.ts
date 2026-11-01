
import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured in the environment.');
  }

  try {
    await mongoose.connect(mongoUri);

    console.info('[Database] MongoDB connected successfully.');
    console.info(`[Database] Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('[Database] MongoDB connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.info('[Database] MongoDB disconnected.');
}
