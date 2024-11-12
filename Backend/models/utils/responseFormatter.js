export const formatSuccess = (data, message = 'Operation successful') => ({
    success: true,
    message,
    data
  });
  
export const formatError = (error, message = 'Operation failed') => ({
    success: false,
    message,
    error: error.message
  });