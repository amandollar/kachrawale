
const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Check if it's strictly an instance of ApiError, if not wrap it
  // But usually we just want to ensure we have a status code and message
  if (!(error instanceof ApiError)) {
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
       error = new ApiError(400, `Resource not found. Invalid: ${err.path || 'unknown path'}`);
    } 
    // Mongoose duplicate key
    else if (err.code === 11000) {
       error = new ApiError(400, `Duplicate field value entered`);
    }
    // Mongoose validation error
    else if (err.name === 'ValidationError') {
       const message = Object.values(err.errors).map(val => val.message).join(', ');
       error = new ApiError(400, message);
    } 
    // JWT errors
    else if (err.name === 'JsonWebTokenError') {
        error = new ApiError(401, 'Invalid token. Please log in again.');
    }
    else {
        // Generic fallback
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server Error';
        error = new ApiError(statusCode, message, err.errors || [], err.stack);
    }
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
  };

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
