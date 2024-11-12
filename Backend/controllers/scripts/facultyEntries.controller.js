import FacultyModel from '../../models/Faculty-Admin/faculty.model.js';
import DepartmentModel from '../../models/Department/department.model.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEPARTMENT_MAP } from '../../models/utils/departmentMapping.js';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });

// Custom logger with colors
const logger = {
    info: (msg) => console.log(chalk.blue('INFO: ') + msg),
    success: (msg) => console.log(chalk.green('SUCCESS: ') + msg),
    warning: (msg) => console.log(chalk.yellow('WARNING: ') + msg),
    error: (msg) => console.log(chalk.red('ERROR: ') + msg),
    debug: (msg) => console.log(chalk.gray('DEBUG: ') + msg),
    divider: () => console.log(chalk.gray('-'.repeat(50)))
};

export const addFacultyEntries = async (csvData) => {
    logger.divider();
    logger.info('Starting addFacultyEntries function');
    logger.divider();

    if (!Array.isArray(csvData) || csvData.length === 0) {
        logger.error('Invalid or empty CSV data received');
        return {
            success: false,
            error: 'Invalid or empty CSV data'
        };
    }

    const validEntries = [];
    const skippedEntries = [];
    const seenEmails = new Set();

    try {
        // Ensure MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            logger.info('Establishing database connection...');
            await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                retryWrites: true,
                w: 'majority'
            });
            logger.success('Database connected successfully');
        }

        for (const entry of csvData) {
            const { "Faculty ID": facultyID, Name: name, Designation: designation, Department: departmentName, Email: email } = entry;

            if (!email || !email.endsWith('@nitj.ac.in')) {
                logger.warning(`Skipping invalid email: ${chalk.yellow(email)}`);
                skippedEntries.push({ facultyID, name, reason: 'Invalid email' });
                continue;
            }

            if (seenEmails.has(email)) {
                logger.warning(`Skipping duplicate email: ${chalk.yellow(email)}`);
                skippedEntries.push({ facultyID, name, reason: 'Duplicate email' });
                continue;
            }

            const departmentID = DEPARTMENT_MAP[departmentName];
            if (!departmentID) {
                logger.warning(`Invalid department: ${chalk.yellow(departmentName)} for faculty ${chalk.cyan(name)} (${chalk.cyan(email)})`);
                skippedEntries.push({ facultyID, name, reason: 'Invalid department name' });
                continue;
            }

            seenEmails.add(email);
            validEntries.push({
                facultyID,
                name,
                designation,
                departmentID,
                email
            });
        }

        const session = await mongoose.startSession();

        const transactionResults = await session.withTransaction(async () => {
            logger.info('MongoDB session started, transaction begun');
            const insertedFaculty = [];

            for (const entry of validEntries) {
                const { facultyID, name, designation, departmentID, email } = entry;

                try {
                    const department = await DepartmentModel.findOne({ departmentID }).session(session);
                    if (!department) {
                        logger.error(`Department not found in database: ${chalk.yellow(departmentID)}`);
                        skippedEntries.push({ facultyID, name, reason: 'Department not found in database' });
                        continue;
                    }

                    const newFaculty = new FacultyModel({
                        facultyID,
                        name,
                        designation,
                        department: department._id,
                        departmentID,
                        email
                    });
                    await newFaculty.save({ session });

                    department.faculty.push(newFaculty._id);
                    await department.updateDepartmentStats(session);

                    insertedFaculty.push(newFaculty);
                    logger.success(`Added new faculty member: ${chalk.cyan(name)} (${chalk.cyan(email)}) in ${chalk.green(department.name)}`);
                } catch (error) {
                    logger.error(`Error processing ${chalk.cyan(name)} (${chalk.cyan(email)}): ${chalk.red(error.message)}`);
                    skippedEntries.push({ facultyID, name, reason: `Database error: ${error.message}` });
                }
            }

            return insertedFaculty;
        });

        session.endSession();
        logger.success('Transaction committed, session ended');
        logger.divider();

        logger.info(chalk.bold('Processing Summary:'));
        logger.divider();
        console.log(`${chalk.blue('Total Valid Entries:')} ${chalk.white(validEntries.length)}`);
        console.log(`${chalk.green('Successfully Added:')} ${chalk.white(transactionResults.length)}`);
        console.log(`${chalk.yellow('Skipped Entries:')}   ${chalk.white(skippedEntries.length)}`);
        logger.divider();

        return {
            success: true,
            addedCount: transactionResults.length,
            skippedEntries
        };

    } catch (error) {
        logger.error(`Error in addFacultyEntries: ${chalk.red(error.message)}`);
        return {
            success: false,
            error: error.message,
            skippedEntries
        };
    }
};
