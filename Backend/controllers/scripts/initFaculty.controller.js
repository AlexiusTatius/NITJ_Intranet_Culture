// scripts/initFaculty.js
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import chalk from 'chalk';
import { processFacultyCSV } from './loadingCSVData.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });


const logger = {
    info: (msg) => console.log(chalk.blue('ℹ ') + msg),
    success: (msg) => console.log(chalk.green('✓ ') + msg),
    warning: (msg) => console.log(chalk.yellow('⚠ ') + msg),
    error: (msg) => console.log(chalk.red('✗ ') + msg),
    divider: () => console.log(chalk.gray('━'.repeat(50))),
    header: (msg) => {
        console.log(chalk.gray('━'.repeat(50)));
        console.log(chalk.bold.blue(msg));
        console.log(chalk.gray('━'.repeat(50)));
    }
};

async function main() {
    try {
        logger.header('FACULTY INITIALIZATION');
        
        // Connect to MongoDB
        logger.info('Establishing database connection...');
        await mongoose.connect(process.env.MONGO_URI);
        logger.success('Connected to MongoDB successfully');

        // Default path to CSV file
        const csvPath = path.join(__dirname, '../../FacultyData/faculty_data.csv');
        logger.info(`Reading CSV from: ${chalk.cyan(csvPath)}`);

        // Process faculty data
        const result = await processFacultyCSV(csvPath);

        if (result.success) {
            logger.header('INITIALIZATION SUCCESSFUL');
            logger.success(chalk.bold('Faculty data imported successfully'));
            if (result.stats) {
                console.log(chalk.bold('\nStatistics:'));
                console.log(`${chalk.blue('Total Processed:')}     ${chalk.white(result.stats.processed || 0)}`);
                console.log(`${chalk.green('Successfully Added:')}  ${chalk.white(result.stats.added || 0)}`);
                console.log(`${chalk.yellow('Skipped Entries:')}    ${chalk.white(result.stats.skipped || 0)}`);
                console.log(`${chalk.red('Failed Entries:')}     ${chalk.white(result.stats.failed || 0)}`);
            }
        } else {
            logger.header('INITIALIZATION FAILED');
            logger.error(result.error || 'Unknown error occurred');
        }

    } catch (error) {
        logger.header('FATAL ERROR');
        logger.error(chalk.bold(error.message));
        console.log(chalk.gray(error.stack));
    } finally {
        if (mongoose.connection.readyState === 1) {
            logger.divider();
            logger.info('Closing database connection...');
            await mongoose.connection.close();
            logger.success('Database connection closed');
        }
        process.exit(0);
    }
}

// Run the script
main().catch(console.error);