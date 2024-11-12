import FacultyModel from '../../models/Faculty-Admin/faculty.model.js';
import DepartmentModel from '../../models/Department/department.model.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEPARTMENT_MAP } from '../../models/utils/departmentMapping.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });

export const addFacultyEntries = async (csvData) => {
    console.log('Starting addFacultyEntries function...');
    
    if (!Array.isArray(csvData) || csvData.length === 0) {
        console.error('Invalid or empty CSV data received');
        return {
            success: false,
            error: 'Invalid or empty CSV data'
        };
    }

    const validEntries = [];
    const skippedEntries = [];
    const seenEmails = new Set();
    let session = null;

    try {
        // Ensure MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            console.log('Establishing database connection...');
            await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                retryWrites: true,
                w: 'majority'
            });
            console.log('Database connected successfully');
        }

        // Start session
        console.log('Starting MongoDB session...');
        session = await mongoose.startSession();
        console.log('Session started successfully');

        // Start transaction
        const result = await session.withTransaction(async () => {
            console.log('Beginning transaction...');
            
            // Process CSV data
            for (const entry of csvData) {
                console.log(`Processing entry for: ${entry.Name}`);
                
                const { "Faculty ID": facultyID, Name: name, Designation: designation, Department: departmentName, Email: email } = entry;

                // Validate email
                if (!email || !email.endsWith('@nitj.ac.in')) {
                    console.log(`Skipping invalid email: ${email}`);
                    skippedEntries.push({ facultyID, name, reason: 'Invalid email' });
                    continue;
                }

                // Check for duplicate emails
                if (seenEmails.has(email)) {
                    console.log(`Skipping duplicate email: ${email}`);
                    skippedEntries.push({ facultyID, name, reason: 'Duplicate email' });
                    continue;
                }

                try {
                    // Get department ID from department mapping
                    const departmentID = DEPARTMENT_MAP[departmentName];
                    if (!departmentID) {
                        console.log(`Invalid department name: ${departmentName}`);
                        skippedEntries.push({ facultyID, name, reason: 'Invalid department name' });
                        continue;
                    }

                    // Verify department exists in database
                    const department = await DepartmentModel.findOne({ departmentID }).session(session);
                    if (!department) {
                        console.log(`Department not found: ${departmentName}`);
                        skippedEntries.push({ facultyID, name, reason: 'Department not found in database' });
                        continue;
                    }

                    seenEmails.add(email);
                    validEntries.push({
                        facultyID,
                        name,
                        designation,
                        department: department._id,
                        departmentID,
                        email
                    });
                } catch (error) {
                    console.error(`Error processing department for ${name}:`, error);
                    skippedEntries.push({ facultyID, name, reason: `Error processing department: ${error.message}` });
                    continue;
                }
            }

            console.log(`Processing summary - Valid: ${validEntries.length}, Skipped: ${skippedEntries.length}`);

            let insertedFaculty = [];
            if (validEntries.length > 0) {
                try {
                    console.log('Inserting faculty members...');
                    // Insert faculty members and get their IDs
                    insertedFaculty = await FacultyModel.create(validEntries, { session });
                    console.log(`Successfully inserted ${insertedFaculty.length} faculty members`);

                    // Group faculty by department for bulk updates
                    const departmentUpdates = {};
                    insertedFaculty.forEach(faculty => {
                        const deptId = faculty.department.toString();
                        if (!departmentUpdates[deptId]) {
                            departmentUpdates[deptId] = [];
                        }
                        departmentUpdates[deptId].push(faculty._id);
                    });

                    // Update department faculty references
                    console.log('Updating department references...');
                    for (const [deptId, facultyIds] of Object.entries(departmentUpdates)) {
                        const department = await DepartmentModel.findById(deptId).session(session);
                        if (department) {
                            // Add new faculty IDs to the department
                            department.faculty = department.faculty.filter(id => id != null); // Remove any null values
                            department.faculty.push(...facultyIds);
                            
                            // Update department stats
                            await department.updateDepartmentStats(session);
                            console.log(`Updated department ${department.name} with ${facultyIds.length} new faculty members`);
                        }
                    }
                } catch (error) {
                    console.error('Error during faculty insertion or department updates:', error);
                    throw error;
                }
            }

            return {
                success: true,
                addedCount: insertedFaculty.length,
                skippedEntries
            };
        }, {
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' }
        });

        console.log('Transaction completed successfully');
        return result;

    } catch (error) {
        console.error('Error in addFacultyEntries:', error);
        return {
            success: false,
            error: error.message,
            skippedEntries
        };
    } finally {
        if (session) {
            console.log('Ending session...');
            await session.endSession();
            console.log('Session ended');
        }
    }
};