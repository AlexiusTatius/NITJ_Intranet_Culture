import fs from 'fs';
import { parse } from 'csv-parse';
import { addFacultyEntries } from './facultyEntries.controller.js';

export const processFacultyCSV = async (filePath) => {
    const csvData = [];

    const parser = fs
        .createReadStream(filePath)
        .pipe(parse({
            columns: true,
            skip_empty_lines: true
        }));

    for await (const row of parser) {
        csvData.push(row);
    }

    return await addFacultyEntries(csvData);
};

// Usage example
const main = async () => {
    try {
        const filePath = './FacultyData/faculty_data.csv'; // Adjust this path as needed
        const result = await processFacultyCSV(filePath);
        console.log('CSV processing result:', result);
    } catch (error) {
        console.error('Error processing CSV:', error);
    }
};

main();