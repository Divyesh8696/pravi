import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './db/connection.js';
import { logger } from './utils/logger.js';

async function startServer() {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      logger.info(`Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', { error: String(error) });
    process.exit(1);
  }
}

startServer();
