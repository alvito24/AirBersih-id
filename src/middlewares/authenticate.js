const tokenService = require('../services/token.service');
const userRepository = require('../repositories/user.repository');
const { errorResponse } = require('../utils/apiResponse');
const { ERROR_CODES } = require('../utils/constants');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Token is missing', ERROR_CODES.TOKEN_MISSING);
    }

    const token = authHeader.split(' ')[1];
    const payload = tokenService.verifyToken(token);
    const user = await userRepository.findSafeById(payload.sub);

    if (!user || !user.is_active) {
      return errorResponse(res, 401, 'Token is invalid', ERROR_CODES.TOKEN_INVALID);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || 401,
      error.statusCode === 500 ? 'Internal server error' : 'Token is missing or invalid',
      error.code || ERROR_CODES.TOKEN_INVALID
    );
  }
}

module.exports = authenticate;
