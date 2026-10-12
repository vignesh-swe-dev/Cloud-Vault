import 'dotenv/config';
import app from './app';
import { connectDB } from './config/database';
import { config } from './config';
import { logger } from './utils/logger';

async function start() {
  await connectDB();
  const server = app.listen(config.port, () => {
    logger.info(`CloudVault API running on port ${config.port} [${config.env}]`);
  });

  const shutdown = () => {
    logger.info('Shutting down server...');
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err) => {
  console.error('Fatal startup error', err);
  process.exit(1);
});
