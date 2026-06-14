const { errorResponse } = require('../utils/apiResponse');
const { ERROR_CODES } = require('../utils/constants');

function authorizeRole(...allowedRoles) {
  return function roleGuard(req, res, next) {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 403, 'Forbidden access', ERROR_CODES.FORBIDDEN);
    }

    return next();
  };
}

module.exports = authorizeRole;
