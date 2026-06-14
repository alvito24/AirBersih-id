const { errorResponse } = require('../utils/apiResponse');
const { ERROR_CODES } = require('../utils/constants');

function notFoundHandler(req, res) {
  return errorResponse(res, 404, 'Route not found', ERROR_CODES.NOT_FOUND);
}

function errorHandler(err, req, res, next) {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const code = err.code || ERROR_CODES.INTERNAL_SERVER_ERROR;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  return errorResponse(res, statusCode, message, code, err.details || []);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
