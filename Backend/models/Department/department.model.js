import mongoose from 'mongoose';
import { DepartmentNotFoundError, DuplicateTeacherError } from '../errors/customErrors.js';
import { ERROR_MESSAGES } from '../utils/errorMessages.js';
import { DEPARTMENT_MAP } from '../utils/departmentMapping.js';

const departmentSchema = new mongoose.Schema({
  departmentID: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  teacher: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherUser'
  }],
  faculty: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  }],
  stats: {
    totalTeachers: {
      type: Number,
      default: 0
    },
    totalFaculty: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
});

// Static method to find department by ID
departmentSchema.statics.findByDepartmentId = async function(departmentId) {
  const department = await this.findOne({ departmentID : departmentId });
  if (!department) {
    throw new DepartmentNotFoundError(ERROR_MESSAGES.DEPARTMENT_NOT_FOUND);
  }

  return department;
}

// Static method to find department by name
departmentSchema.statics.findByDepartmentName = async function(name) {
  console.log("name: ", name);
  const departmentId = DEPARTMENT_MAP[name];
  if (!departmentId) {
    throw new DepartmentNotFoundError(ERROR_MESSAGES.INVALID_DEPARTMENT);
  }

  const department = await this.findOne({ departmentID: departmentId });
  if (!department) {
    throw new DepartmentNotFoundError(ERROR_MESSAGES.DEPARTMENT_NOT_FOUND);
  }

  return department;
};

// Method to add teacher reference with duplicate check
departmentSchema.methods.addTeacherReference = async function(teacherId, session) {
  if (this.teacher.includes(teacherId)) {
    throw new DuplicateTeacherError(ERROR_MESSAGES.DUPLICATE_TEACHER);
  }

  this.teacher.push(teacherId);
  this.stats.totalTeachers += 1;
  this.stats.lastUpdated = new Date();

  if (session) {
    return this.save({ session });
  }
  return this.save();
};

// Method to update department statistics
departmentSchema.methods.updateDepartmentStats = async function(session) {
  this.stats.totalTeachers = this.teacher.length;
  this.stats.totalFaculty = this.faculty.length;
  this.stats.lastUpdated = new Date();

  if (session) {
    return this.save({ session });
  }
  return this.save();
};

const DepartmentModel = mongoose.model('Department', departmentSchema);
export default DepartmentModel;