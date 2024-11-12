import mongoose from 'mongoose';
import { logger } from '../middleware/logger.js';

export const executeTransaction = async (operations) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await operations(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Transaction failed: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
};