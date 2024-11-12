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
console.log(chalk.gray('Configuration:'));
console.log(chalk.gray('→ ') + 'Loading .env from: ' + chalk.cyan(envPath));
dotenv.config({ path: envPath });

console.log(chalk.gray('→ ') + 'Using MongoDB URI: ' + chalk.cyan(process.env.MONGO_URI));

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

async function initializeDepartments() {
    try {
        logger.header('DEPARTMENT INITIALIZATION');
        logger.info('Establishing database connection...');
        
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        logger.success('Connected to MongoDB successfully');

        const stats = {
            existing: 0,
            created: 0,
            failed: 0,
            total: Object.entries(DEPARTMENT_MAP).length
        };

        logger.header('PROCESSING DEPARTMENTS');
        logger.info(`Found ${chalk.cyan(stats.total)} departments to process`);

        // Process each department
        for (const [departmentName, departmentID] of Object.entries(DEPARTMENT_MAP)) {
            process.stdout.write(chalk.gray(`Processing: ${chalk.cyan(departmentName)} [${chalk.yellow(departmentID)}] ... `));
            
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
                        process.stdout.write(chalk.yellow('EXISTS\n'));
                        stats.existing++;
                    } else {
                        process.stdout.write(chalk.red('CONFLICT\n'));
                        logger.warning(
                            `Conflict: ${chalk.cyan(departmentName)} (${chalk.yellow(departmentID)}) ` +
                            `conflicts with existing: ${chalk.cyan(existingDepartment.name)} (${chalk.yellow(existingDepartment.departmentID)})`
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
                process.stdout.write(chalk.green('CREATED\n'));
                stats.created++;

            } catch (error) {
                process.stdout.write(chalk.red('ERROR\n'));
                logger.error(`Failed to process ${chalk.cyan(departmentName)}: ${chalk.red(error.message)}`);
                stats.failed++;
            }
        }

        // Print summary
        logger.header('INITIALIZATION SUMMARY');
        console.log(chalk.bold('Statistics:'));
        console.log(`${chalk.blue('Total Departments:')}    ${chalk.white(stats.total)}`);
        console.log(`${chalk.green('Successfully Created:')} ${chalk.white(stats.created)}`);
        console.log(`${chalk.yellow('Already Existing:')}    ${chalk.white(stats.existing)}`);
        console.log(`${chalk.red('Failed to Process:')}    ${chalk.white(stats.failed)}`);
        logger.divider();

        // Verify final state
        const allDepartments = await DepartmentModel.find({});
        logger.info(`Current database state: ${chalk.cyan(allDepartments.length)} total departments`);

        // Check for unmapped departments
        const extraDepartments = allDepartments.filter(
            dept => !Object.values(DEPARTMENT_MAP).includes(dept.departmentID)
        );

        if (extraDepartments.length > 0) {
            logger.header('UNMAPPED DEPARTMENTS FOUND');
            extraDepartments.forEach(dept => {
                logger.warning(`${chalk.yellow('→')} ${chalk.cyan(dept.name)} (${chalk.yellow(dept.departmentID)})`);
            });
        }

        logger.divider();
        if (stats.failed === 0 && stats.created + stats.existing === stats.total) {
            logger.success(chalk.bold('Initialization completed successfully'));
        } else {
            logger.warning(chalk.bold('Initialization completed with some issues'));
        }

    } catch (error) {
        logger.header('FATAL ERROR');
        logger.error(`${chalk.red(error.message)}`);
        console.log(chalk.gray(error.stack));
        throw error;
    } finally {
        if (mongoose.connection.readyState === 1) {
            logger.divider();
            logger.info('Closing database connection...');
            await mongoose.connection.close();
            logger.success('Database connection closed');
        }
    }
}

// Main execution
(async () => {
    try {
        logger.header('STARTING INITIALIZATION');
        await initializeDepartments();
    } catch (error) {
        logger.error(chalk.bold('Script failed with error:'));
        logger.error(error.stack);
    } finally {
        logger.divider();
        process.exit(0);
    }
})();

export { initializeDepartments };