import fs from 'fs';
import { parse } from 'csv-parse';
import { addFacultyEntries } from './facultyEntries.controller.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Promisified CSV parsing function
export const parseCSV = async (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(parse({
                columns: true,
                skip_empty_lines: true,
                trim: true // Trim whitespace from values
            }))
            .on('data', (data) => {
                // Validate required fields
                const requiredFields = ['Faculty ID', 'Name', 'Designation', 'Department', 'Email'];
                const missingFields = requiredFields.filter(field => !data[field]);
                
                if (missingFields.length === 0) {
                    results.push(data);
                } else {
                    console.warn(`Skipping row due to missing fields: ${missingFields.join(', ')}`, data);
                }
            })
            .on('error', (error) => reject(error))
            .on('end', () => resolve(results));
    });
};

// Main processing function
export const processFacultyCSV = async (filePath) => {
    try {
        console.log('Step 1: Starting CSV processing');
        console.log('File path:', filePath);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at: ${filePath}`);
        }
        
        // Validate file extension
        const fileExtension = path.extname(filePath).toLowerCase();
        if (fileExtension !== '.csv') {
            throw new Error('Invalid file type. Please provide a CSV file.');
        }
        
        console.log('Step 2: File exists and valid, starting to parse');

        // Parse CSV
        const csvData = await parseCSV(filePath);
        console.log('Step 3: CSV parsed, valid rows found:', csvData.length);
        
        if (csvData.length === 0) {
            throw new Error('No valid data found in CSV file');
        }

        console.log('Step 4: Sample data from first row:', JSON.stringify(csvData[0], null, 2));

        // Process faculty entries
        console.log('Step 5: Starting faculty entries processing');
        const result = await addFacultyEntries(csvData);
        console.log('Step 6: Faculty entries processed');

        return result;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
};

// // Main execution
// console.log('Script started');
// const run = async () => {
//     try {
//         // Allow for custom file path from command line argument
//         const filePath = process.argv[2] || path.join(__dirname, '../../FacultyData/faculty_data.csv');
//         console.log('Using file path:', filePath);
        
//         const result = await processFacultyCSV(filePath);
//         console.log('Final results:', result);
        
//         if (result.success) {
//             console.log('Faculty data import completed successfully');
//             process.exit(0);
//         } else {
//             console.error('Faculty data import completed with errors');
//             process.exit(1);
//         }
//     } catch (error) {
//         console.error('Fatal error:', error.message);
//         process.exit(1);
//     }
// };


// // Run the script if it's the main module
// if (import.meta.url === `file://${process.argv[1]}`) {
//     run().catch(console.error);
// }