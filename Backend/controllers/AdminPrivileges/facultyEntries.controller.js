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
    const validEntries = [];
    const skippedEntries = [];
    const seenEmails = new Set();
    const session = await mongoose.startSession();

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected");

        await session.withTransaction(async () => {
            // Process CSV data
            for (const entry of csvData) {
                const { "Faculty ID": facultyID, Name: name, Designation: designation, Department: departmentName, Email: email } = entry;

                // Skip entries with empty email or non-nitj.ac.in domain
                if (!email || !email.endsWith('@nitj.ac.in')) {
                    skippedEntries.push({ facultyID, name, reason: 'Invalid email' });
                    continue;
                }

                // Handle duplicate emails
                if (seenEmails.has(email)) {
                    skippedEntries.push({ facultyID, name, reason: 'Duplicate email' });
                    continue;
                }

                try {
                    // Get department ID from department name using DEPARTMENT_MAP
                    const departmentID = DEPARTMENT_MAP[departmentName];
                    if (!departmentID) {
                        skippedEntries.push({ facultyID, name, reason: 'Invalid department name' });
                        continue;
                    }

                    // Find or verify department exists
                    const department = await DepartmentModel.findOne({ departmentID }).session(session);
                    if (!department) {
                        skippedEntries.push({ facultyID, name, reason: 'Department not found in database' });
                        continue;
                    }

                    seenEmails.add(email);
                    validEntries.push({
                        facultyID,
                        name,
                        designation,
                        department: department._id, // Use department ObjectId
                        departmentID,
                        email
                    });
                } catch (error) {
                    skippedEntries.push({ facultyID, name, reason: `Error processing department: ${error.message}` });
                    continue;
                }
            }

            console.log('Valid Entries:', validEntries[0]);
            console.log(`Total entries: ${csvData.length}`);
            console.log(`Valid entries: ${validEntries.length}`);
            console.log(`Skipped entries: ${skippedEntries.length}`);

            let insertedCount = 0;

            if (validEntries.length > 0) {
                // Bulk insert faculty members
                const bulkOps = validEntries.map(entry => ({
                    insertOne: { document: entry }
                }));

                const result = await FacultyModel.bulkWrite(bulkOps, {
                    session,
                    ordered: false
                });
                insertedCount = result.insertedCount;

                // Update department faculty references and stats
                for (const entry of validEntries) {
                    const department = await DepartmentModel.findById(entry.department).session(session);
                    if (department) {
                        department.faculty.push(entry._id);
                        await department.updateDepartmentStats(session);
                    }
                }
            }

            return {
                success: true,
                addedCount: insertedCount,
                skippedEntries
            };
        });
    } catch (error) {
        console.error('Transaction error:', error);
        return {
            success: false,
            error: error.message,
            skippedEntries
        };
    } finally {
        await session.endSession();
    }
};