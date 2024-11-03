import { logger } from './logger.js';
import { formatError } from './responseFormatter.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`, {
    name: err.name,
    stack: err.stack,
    path: req.path
  });

  const errorResponse = formatError(err);

  switch (err.name) {
    case 'FacultyVerificationError':
    case 'DepartmentNotFoundError':
      return res.status(404).json(errorResponse);
    case 'DuplicateTeacherError':
      return res.status(409).json(errorResponse);
    case 'TransactionError':
      return res.status(500).json(errorResponse);
    default:
      return res.status(500).json(errorResponse);
  }
};