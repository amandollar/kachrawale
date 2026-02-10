
const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  try {
    // Validate req.body (or query/params if needed)
    // Validate req.body and replace with parsed data (to keep transformations)
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err.issues) {
       // Zod Error - Zod uses 'issues' property, not 'errors'
       const errorMessage = err.issues.map(e => e.message).join(', ');
       // Throw ApiError, global middleware will handle it
       return next(new ApiError(400, errorMessage, err.issues));
    }
    return next(new ApiError(400, err.message || 'Validation failed'));
  }
};

module.exports = validate;
