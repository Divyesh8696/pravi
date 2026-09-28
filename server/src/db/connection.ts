import mongoose, { ClientSession } from 'mongoose';
import { connectDB, disconnectDB } from '../config/database.js';

export { connectDB, disconnectDB };

/**
 * Executes a callback within a managed MongoDB replica-set transaction.
 * Automatically commits on success or aborts and rolls back on failure.
 */
export async function withTransaction<T>(
  callback: (session: ClientSession) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();
  try {
    let result: T;
    await session.withTransaction(async () => {
      result = await callback(session);
    });
    return result!;
  } finally {
    await session.endSession();
  }
}
