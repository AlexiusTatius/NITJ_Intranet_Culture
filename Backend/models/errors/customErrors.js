export class FacultyVerificationError extends Error {
    constructor(message) {
      super(message);
      this.name = 'FacultyVerificationError';
    }
  }
  
  export class DepartmentNotFoundError extends Error {
    constructor(message) {
      super(message);
      this.name = 'DepartmentNotFoundError';
    }
  }
  
  export class DuplicateTeacherError extends Error {
    constructor(message) {
      super(message);
      this.name = 'DuplicateTeacherError';
    }
  }
  
  export class TransactionError extends Error {
    constructor(message) {
      super(message);
      this.name = 'TransactionError';
    }
  }
  
  // middleware/logger.js
  import winston from 'winston';
  
  export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ]
  });