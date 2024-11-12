// models/faculty.model.js
import mongoose from 'mongoose';
import { FacultyVerificationError } from '../errors/customErrors.js';
import { ERROR_MESSAGES } from '../utils/errorMessages.js';
import { logger } from '../middleware/logger.js';
import DepartmentModel from '../Department/department.model.js';
import { DEPARTMENT_MAP } from '../utils/departmentMapping.js';

const facultySchema = new mongoose.Schema({
  facultyID: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  designation: {
    type: String
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  departmentID: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
});

// Compound index with department first for optimal querying
facultySchema.index({ department: 1, email: 1 });

// Helper method to get department information
facultySchema.statics.getDepartmentInfo = async function(departmentName) {
  logger.debug(`Fetching department info for: ${departmentName}`);
  
  const departmentID = DEPARTMENT_MAP[departmentName];
  if (!departmentID) {
    throw new FacultyVerificationError(ERROR_MESSAGES.INVALID_DEPARTMENT);
  }

  const department = await DepartmentModel.findOne({ departmentID }).lean();
  if (!department) {
    throw new FacultyVerificationError(ERROR_MESSAGES.DEPARTMENT_NOT_FOUND);
  }

  logger.debug(`Department found: ${department.name}`);
  return department;
};

// Method 1: Direct verification using compound index
facultySchema.statics.verifyFacultyMember = async function(email, departmentName) {
  logger.debug(`Verifying faculty member with email: ${email} in department: ${departmentName}`);
  
  try {
    // Get department info using helper method
    const department = await this.getDepartmentInfo(departmentName);

    // Use compound index for efficient querying
    const faculty = await this.findOne({ 
      department: department._id, 
      email 
    })
    .populate('department', 'name departmentID')
    .lean();
    
    if (!faculty) {
      logger.warn(`Faculty verification failed for email: ${email} in department: ${departmentName}`);
      throw new FacultyVerificationError(ERROR_MESSAGES.FACULTY_NOT_FOUND);
    }

    logger.info(`Faculty member verified in department: ${departmentName}`);
    return faculty;
  } catch (error) {
    logger.error(`Faculty verification failed: ${error.message}`);
    throw error;
  }
};

// Document the below code.
// Method 2: Verification through department population
// facultySchema.statics.verifyFacultyThroughDepartment = async function(email, departmentName) {
//   logger.debug(`Verifying faculty member through department: ${departmentName}`);
  
//   try {
//     // Get department info using helper method
//     const department = await this.getDepartmentInfo(departmentName);

//     const faculty = await department.populate({
//       path: 'faculty',
//       match: {email},
//       select: 'name designation email',
//     })

//     if (!faculty) {
//       throw new FacultyVerificationError(
//         `${ERROR_MESSAGES.FACULTY_NOT_FOUND} in department ${departmentName}`
//       );
//     }

//     return { ...faculty, department };
//   } catch (error) {
//     logger.error(`Faculty verification through department failed: ${error.message}`);
//     throw error;
//   }
// };

// // Performance comparison method
// facultySchema.statics.compareVerificationMethods = async function(email, departmentName) {
//   logger.debug(`Comparing verification methods for email: ${email}`);
  
//   try {
//     // Time Method 1: Direct verification
//     const startTime1 = Date.now();
//     const result1 = await this.verifyFacultyMember(email, departmentName).catch(() => null);
//     const time1 = Date.now() - startTime1;

//     // Time Method 2: Department population
//     const startTime2 = Date.now();
//     const result2 = await this.verifyFacultyThroughDepartment(email, departmentName).catch(() => null);
//     const time2 = Date.now() - startTime2;

//     logger.info(`Performance comparison:
//       Direct method: ${time1}ms
//       Department method: ${time2}ms`);

//     return {
//       directMethod: { result: result1, time: time1 },
//       departmentMethod: { result: result2, time: time2 },
//       fasterMethod: time1 <= time2 ? 'directMethod' : 'departmentMethod',
//       timeDifference: Math.abs(time1 - time2)
//     };
//   } catch (error) {
//     logger.error(`Comparison failed: ${error.message}`);
//     throw error;
//   }
// };

const FacultyModel = mongoose.model('Faculty', facultySchema);
export default FacultyModel;



/* Document this whole code using claude, very good thing*/