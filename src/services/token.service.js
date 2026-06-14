const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { ERROR_CODES } = require('../utils/constants');

function ensureJwtSecret() {
  if (!env.jwtSecret) {
    const error = new Error('JWT secret is not configured');
    error.statusCode = 500;
    error.code = ERROR_CODES.INTERNAL_SERVER_ERROR;
    throw error;
  }
}

function generateToken(user) {
  ensureJwtSecret();

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function verifyToken(token) {
  ensureJwtSecret();

  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (error) {
    const authError = new Error('Token is missing or invalid');
    authError.statusCode = 401;
    authError.code = ERROR_CODES.TOKEN_INVALID;
    throw authError;
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
