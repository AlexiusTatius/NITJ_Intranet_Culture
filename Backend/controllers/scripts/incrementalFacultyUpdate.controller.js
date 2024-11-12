import FacultyModel from '../../models/Faculty-Admin/faculty.model.js';
import DepartmentModel from '../../models/Department/department.model.js';
import { DEPARTMENT_MAP } from '../../models/utils/departmentMapping.js';
import mongoose from 'mongoose';
import { parseCSV } from './loadingCSVData.controller.js';
import chalk from 'chalk';

// Custom logger with colors
const logger = {
    info: (msg) => console.log(chalk.blue('INFO: ') + msg),
    success: (msg) => console.log(chalk.green('SUCCESS: ') + msg),
    warning: (msg) => console.log(chalk.yellow('WARNING: ') + msg),
    error: (msg) => console.log(chalk.red('ERROR: ') + msg),
    debug: (msg) => console.log(chalk.gray('DEBUG: ') + msg),
    divider: () => console.log(chalk.gray('-'.repeat(50)))
};

export const processIncrementalFacultyUpdates = async (csvData) => {
  logger.divider();
  logger.info('Starting incremental faculty update process');
  logger.divider();
  
  if (!Array.isArray(csvData) || csvData.length === 0) {
    logger.error('Invalid or empty CSV data received');
    return {
      success: false,
      error: 'Invalid or empty CSV data'
    };
  }

  const stats = {
    totalProcessed: 0,
    newEntries: 0,
    skipped: 0,
    invalidDepartments: 0,
    invalidEmails: 0,  // Added a counter for invalid emails
    errors: []
  };

  let session = null;

  try {
    // Start MongoDB session for transactions
    session = await mongoose.startSession();
    logger.info('MongoDB session started');
    
    // Get all existing faculty emails for comparison
    const existingFacultyEmails = new Set(
      (await FacultyModel.find({}, 'email').lean()).map(f => f.email)
    );
    logger.info(`Found ${chalk.cyan(existingFacultyEmails.size)} existing faculty members`);

    // Process entries in chunks to avoid memory issues with large CSV files
    const CHUNK_SIZE = 100;
    for (let i = 0; i < csvData.length; i += CHUNK_SIZE) {
      const chunk = csvData.slice(i, i + CHUNK_SIZE);
      logger.debug(`Processing chunk ${Math.floor(i/CHUNK_SIZE) + 1} of ${Math.ceil(csvData.length/CHUNK_SIZE)}`);
      
      for (const entry of chunk) {
        try {
          stats.totalProcessed++;
          const { "Faculty ID": facultyID, Name: name, Designation: designation, 
                  Department: departmentName, Email: email } = entry;

          // Skip if faculty already exists
          if (existingFacultyEmails.has(email)) {
            logger.info(`${chalk.yellow('⚠')} Skipping existing faculty: ${chalk.cyan(email)}`);
            stats.skipped++;
            continue;
          }

          // Validate email domain
          if (!email.endsWith('@nitj.ac.in')) {
            logger.warning(`${chalk.yellow('⚠')} Invalid email domain for faculty: ${chalk.cyan(email)}`);
            stats.invalidEmails++;  // Increment invalid email count
            stats.errors.push({
              entry: email,
              error: 'Invalid email domain'
            });
            continue;
          }

          // Validate department - skip invalid departments
          const departmentID = DEPARTMENT_MAP[departmentName];
          if (!departmentID) {
            logger.warning(`${chalk.yellow('⚠')} Invalid department: ${chalk.yellow(departmentName)} for faculty ${chalk.cyan(name)} (${chalk.cyan(email)})`);
            stats.invalidDepartments++;
            stats.errors.push({
              entry: email,
              error: `Invalid department: ${departmentName}`
            });
            continue;
          }

          // Start a new transaction for each faculty member
          await session.withTransaction(async () => {
            // Find department in database
            const department = await DepartmentModel.findOne({ departmentID }).session(session);
            if (!department) {
              throw new Error(`Department found in mapping but not in database: ${departmentName}`);
            }

            // Create new faculty entry
            const newFaculty = new FacultyModel({
              facultyID,
              name,
              designation,
              department: department._id,
              departmentID,
              email
            });

            // Save the new faculty member
            const savedFaculty = await newFaculty.save({ session });

            // Update department's faculty array
            department.faculty.push(savedFaculty._id);
            await department.updateDepartmentStats(session);

            stats.newEntries++;
            logger.success(`${chalk.green('✓')} Added new faculty member: ${chalk.cyan(name)} (${chalk.cyan(email)}) in ${chalk.green(departmentName)}`);
          });

        } catch (error) {
          stats.errors.push({
            entry: entry.email || 'Unknown',
            error: error.message
          });
          logger.error(`${chalk.red('✗')} Error processing faculty: ${chalk.red(error.message)}`);
        }
      }
    }

    logger.divider();
    logger.info(chalk.bold('Update Summary:'));
    logger.divider();
    console.log(`${chalk.blue('Total Processed:')}    ${chalk.white(stats.totalProcessed)}`);
    console.log(`${chalk.green('Successfully Added:')} ${chalk.white(stats.newEntries)}`);
    console.log(`${chalk.yellow('Existing Skipped:')}  ${chalk.white(stats.skipped)}`);
    console.log(`${chalk.yellow('Invalid Departments:')} ${chalk.white(stats.invalidDepartments)}`);
    console.log(`${chalk.yellow('Invalid Emails:')}    ${chalk.white(stats.invalidEmails)}`);  // Log invalid email count
    console.log(`${chalk.red('Errors:')}            ${chalk.white(stats.errors.length)}`);
    logger.divider();

    if (stats.errors.length > 0) {
      logger.warning('Error Details:');
      stats.errors.forEach(error => {
        console.log(`${chalk.yellow('→')} ${chalk.cyan(error.entry)}: ${chalk.red(error.error)}`);
      });
      logger.divider();
    }

    return {
      success: true,
      stats,
      message: 'Update completed successfully'
    };

  } catch (error) {
    logger.error(chalk.bold('Fatal Error:'));
    logger.error(error.message);
    return {
      success: false,
      stats,
      error: error.message
    };
  } finally {
    if (session) {
      await session.endSession();
      logger.info('MongoDB session closed');
    }
    logger.divider();
  }
};


export const runIncrementalUpdate = async (csvFilePath) => {
  try {
    logger.info(chalk.bold('Starting Faculty Update Process'));
    logger.info(`Reading CSV from: ${chalk.cyan(csvFilePath)}`);
    
    // Parse CSV data
    const csvData = await parseCSV(csvFilePath);
    logger.success(`CSV parsed successfully - Found ${chalk.cyan(csvData.length)} entries`);
    
    // Process incremental updates
    const result = await processIncrementalFacultyUpdates(csvData);
    
    if (result.success) {
      logger.success(chalk.bold('✓ Update process completed successfully'));
    } else {
      logger.error(chalk.bold('✗ Update process failed'));
    }
    
    return result;
  } catch (error) {
    logger.error(chalk.bold('Fatal Error in Update Process:'));
    logger.error(error.message);
    throw error;
  }
};