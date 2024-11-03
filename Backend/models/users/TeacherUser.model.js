import mongoose from 'mongoose';
import { TransactionError } from '../errors/customErrors.js';
import { ERROR_MESSAGES } from '../utils/errorMessages.js';
import { executeTransaction } from '../utils/transactionHelpers.js';
import { logger } from '../middleware/logger.js';
import FacultyModel from '../Faculty-Admin/faculty.model.js';
import DepartmentModel from '../Department/department.model.js';

const TeacherUserSchema = new mongoose.Schema({
  username: { 
    type: String,
    required: true 
  },
  email: {
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  resetToken: {
    type: String,
    required: false
  },
  folderPath: {
    type: String,
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    required: false
  },
  verificationTokenExpires: {
    type: Date,
    required: false
  }
});
TeacherUserSchema.index({ department: 1, email: 1 });

TeacherUserSchema.statics.findByDepartmentAndEmail = async function(departmentId, email) {
  const department = await DepartmentModel.findByDepartmentName(departmentId);
  if (!department) {
    throw new DepartmentNotFoundError(ERROR_MESSAGES.DEPARTMENT_NOT_FOUND);
  }

  try {
    logger.debug(`Attempting to find teacher with email: ${email} in department: ${departmentId}`);
    
    const teacher = await this.findOne({
      department: department._id,
      email: email
    }).populate('department faculty');

    if (!teacher) {
      logger.debug(`No teacher found with email: ${email} in department: ${departmentId}`);
      return null;
    }

    logger.debug(`Successfully found teacher with email: ${email} in department: ${departmentId}`);
    return teacher;
  } catch (error) {
    logger.error(`Error finding teacher: ${error.message}`);
    throw new TransactionError(ERROR_MESSAGES.QUERY_FAILED);
  }
};

// Static method to find teacher by faculty ID
TeacherUserSchema.statics.findByFacultyId = async function(facultyId) {
  return this.findOne({ faculty: facultyId }).populate('department faculty');
};

TeacherUserSchema.statics.TeacherFacultyVerify = async function(userData){
    // Step 1: Verify whether the teacher is a faculty member   
    const faculty = await FacultyModel.verifyFacultyMember(userData.email, userData.department);

    // Step 2: Get and verify department
    const department = await DepartmentModel.findByDepartmentName(userData.department);

    if (faculty && department){
      logger.debug(`The teacher with email: ${userData.email} exists in the department: ${userData.department}`);
      return {faculty, department};
    }
    else{
      logger.debug(`The teacher with email: ${userData.email} DOES NOT EXIST in the department: ${userData.department}`);
      return {};
    }
}


// Main registration method with transaction
TeacherUserSchema.statics.registerTeacherFaculty = async function(userData) {
  const registerOperation = async (session) => {
    logger.info(`Starting teacher registration process for email: ${userData.email}`);

    // Step 3: Create teacher user
    const teacherUser = new this({
      ...userData,
    });

    await teacherUser.save({ session });

    // Step 4: Update department references
    await department.addTeacherReference(teacherUser._id, session);

    // Step 5: Update department statistics
    await department.updateDepartmentStats(session);

    logger.info(`Teacher registration completed successfully for email: ${userData.email}`);
    return teacherUser;
  };

  try {
    return await executeTransaction(registerOperation);
  } catch (error) {
    logger.error(`Teacher registration failed: ${error.message}`);
    throw new TransactionError(ERROR_MESSAGES.TRANSACTION_FAILED);
  }
};

const TeacherUserModel = mongoose.model('TeacherUser', TeacherUserSchema);
export default TeacherUserModel;