// scripts/updateFaculty.js
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { runIncrementalUpdate } from './incrementalFacultyUpdate.controller.js';
import { logger } from '../../models/middleware/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });

async function main() {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB');

    // Default path to CSV file
    const csvPath = path.join(__dirname, '../../FacultyData/faculty_data.csv');
    
    // Run the update
    logger.info('Starting faculty update process...');
    const result = await runIncrementalUpdate(csvPath);
    
    // Log results
    if (result.success) {
      logger.info('Update completed successfully', {
        totalProcessed: result.stats.totalProcessed,
        newEntries: result.stats.newEntries,
        skipped: result.stats.skipped
      });
    } else {
      logger.error('Update failed:', result.error);
    }

  } catch (error) {
    logger.error('Script execution failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  }
}

// Run the script
main().catch(console.error);