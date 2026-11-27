import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer = null;
let dbMode = 'mongodb';

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return dbMode;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/atelier_lumiere';
  const allowFallback =
    !process.env.VERCEL && process.env.USE_IN_MEMORY_FALLBACK !== 'false';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    dbMode = 'mongodb';
    console.log(`[DB] Connected to MongoDB`);
    return dbMode;
  } catch (err) {
    if (!allowFallback) {
      throw new Error(
        `MongoDB connection failed (${err.message}). Set a valid MONGODB_URI environment variable (e.g. MongoDB Atlas) for production deployment.`
      );
    }
    console.warn(`[DB] Local MongoDB unavailable (${err.message}). Starting embedded MongoMemoryServer...`);
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'atelier_lumiere',
      },
    });
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    dbMode = 'memory';
    console.log(`[DB] Connected to embedded MongoDB instance at ${memUri}`);
    return dbMode;
  }
}

export function getDatabaseMode() {
  return dbMode;
}

export async function closeDatabase() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
