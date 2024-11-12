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