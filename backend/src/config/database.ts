import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../utils/logger';

let _memServer: import('mongodb-memory-server').MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  let uri = config.mongodb.uri;

  // In development, fall back to an in-memory MongoDB if the real one is unavailable
  if (config.isDev) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      logger.info('MongoDB connected');
      return;
    } catch {
      logger.warn('Local MongoDB not available — starting mongodb-memory-server for development');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      _memServer = await MongoMemoryServer.create();
      uri = _memServer.getUri();
      logger.info(`mongodb-memory-server running at ${uri}`);
    }
  }

  try {
    await mongoose.connect(uri);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection error', { err });
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (_memServer) {
    await _memServer.stop();
    _memServer = null;
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});
