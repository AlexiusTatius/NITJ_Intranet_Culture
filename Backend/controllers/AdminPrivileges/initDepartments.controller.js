import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import DepartmentModel from '../../models/Department/department.model.js';
import { DEPARTMENT_MAP } from '../../models/utils/departmentMapping.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure environment variables
const envPath = path.resolve(__dirname, '..', '..', '..', '.env');
console.log('Looking for .env file at:', envPath);
dotenv.config({ path: envPath });

console.log('MONGO_URI:', process.env.MONGO_URI);

const logger = {
    info: (msg) => console.log(chalk.blue('INFO: ') + msg),
    success: (msg) => console.log(chalk.green('SUCCESS: ') + msg),
    warning: (msg) => console.log(chalk.yellow('WARNING: ') + msg),
    error: (msg) => console.log(chalk.red('ERROR: ') + msg),
    divider: () => console.log(chalk.gray('-'.repeat(50)))
};

async function initializeDepartments() {
    try {
        logger.info('Attempting to connect to MongoDB...');
        
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        logger.success('Connected to MongoDB');

        const stats = {
            existing: 0,
            created: 0,
            failed: 0,
            total: Object.entries(DEPARTMENT_MAP).length
        };

        logger.info(`Processing ${stats.total} departments...`);

        // Process each department
        for (const [departmentName, departmentID] of Object.entries(DEPARTMENT_MAP)) {
            logger.info(`Processing department: ${departmentName} (${departmentID})`);
            
            try {
                // Check if department exists
                const existingDepartment = await DepartmentModel.findOne({
                    $or: [
                        { departmentID },
                        { name: departmentName }
                    ]
                });

                if (existingDepartment) {
                    if (existingDepartment.departmentID === departmentID && 
                        existingDepartment.name === departmentName) {
                        logger.info(`Department already exists: ${departmentName} (${departmentID})`);
                        stats.existing++;
                    } else {
                        logger.warning(
                            `Conflict detected for ${departmentName} (${departmentID}). ` +
                            `Existing record: ${existingDepartment.name} (${existingDepartment.departmentID})`
                        );
                        stats.failed++;
                    }
                    continue;
                }

                // Create new department
                const newDepartment = new DepartmentModel({
                    departmentID,
                    name: departmentName,
                    teacher: [],
                    faculty: [],
                    stats: {
                        totalTeachers: 0,
                        totalFaculty: 0,
                        lastUpdated: new Date()
                    }
                });

                await newDepartment.save();
                logger.success(`Created new department: ${departmentName} (${departmentID})`);
                stats.created++;

            } catch (error) {
                logger.error(`Failed to process ${departmentName}: ${error.message}`);
                stats.failed++;
            }
        }

        // Print summary
        logger.divider();
        logger.info('Initialization Summary:');
        logger.info(`Total departments in mapping: ${stats.total}`);
        logger.success(`Successfully created: ${stats.created}`);
        logger.info(`Already existing: ${stats.existing}`);
        logger.error(`Failed to process: ${stats.failed}`);
        logger.divider();

        // Verify final state
        const allDepartments = await DepartmentModel.find({});
        logger.info(`Total departments in database: ${allDepartments.length}`);

        // Check for unmapped departments
        const extraDepartments = allDepartments.filter(
            dept => !Object.values(DEPARTMENT_MAP).includes(dept.departmentID)
        );

        if (extraDepartments.length > 0) {
            logger.warning('Found departments in database that are not in DEPARTMENT_MAP:');
            extraDepartments.forEach(dept => {
                logger.warning(`- ${dept.name} (${dept.departmentID})`);
            });
        }

    } catch (error) {
        logger.error(`Fatal error: ${error.stack}`);
        throw error;
    } finally {
        if (mongoose.connection.readyState === 1) {
            logger.info('Closing database connection...');
            await mongoose.connection.close();
            logger.info('Database connection closed');
        }
    }
}

// Self-executing function with error handling
(async () => {
    try {
        logger.info('Starting department initialization...');
        await initializeDepartments();
        logger.success('Script completed successfully');
    } catch (error) {
        logger.error('Script failed with error:');
        logger.error(error.stack);
    } finally {
        process.exit(0);
    }
})();