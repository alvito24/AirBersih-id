const roleRepository = require('../repositories/role.repository');
const userRepository = require('../repositories/user.repository');
const tokenService = require('./token.service');
const { hashPassword, comparePassword } = require('../utils/password');
const { validateRegisterInput, validateLoginInput } = require('../utils/validation');
const { ERROR_CODES, ROLES } = require('../utils/constants');

function createError(message, statusCode, code, details = []) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

async function register(payload) {
  const validation = validateRegisterInput(payload);
  if (!validation.isValid) {
    throw createError('Validation error', 400, ERROR_CODES.VALIDATION_ERROR, validation.details);
  }

  const existingUser = await userRepository.findByEmail(validation.value.email);
  if (existingUser) {
    throw createError('Email already registered', 409, ERROR_CODES.EMAIL_ALREADY_EXISTS);
  }

  const wargaRole = await roleRepository.findByCode(ROLES.WARGA);
  if (!wargaRole) {
    throw createError('Default role is not available', 500, ERROR_CODES.INTERNAL_SERVER_ERROR);
  }

  const passwordHash = await hashPassword(validation.value.password);

  const user = await userRepository.createUser({
    roleId: wargaRole.id,
    name: validation.value.name,
    email: validation.value.email,
    passwordHash,
    phone: validation.value.phone,
    address: validation.value.address,
  });

  return { user };
}

async function login(payload) {
  const validation = validateLoginInput(payload);
  if (!validation.isValid) {
    throw createError('Validation error', 400, ERROR_CODES.VALIDATION_ERROR, validation.details);
  }

  const user = await userRepository.findByEmail(validation.value.email);
  if (!user) {
    throw createError('Invalid email or password', 401, ERROR_CODES.INVALID_CREDENTIALS);
  }

  if (!user.is_active) {
    throw createError('User is inactive', 403, ERROR_CODES.USER_INACTIVE);
  }

  const isPasswordValid = await comparePassword(validation.value.password, user.password_hash);
  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401, ERROR_CODES.INVALID_CREDENTIALS);
  }

  const safeUser = toSafeUser(user);
  const token = tokenService.generateToken(safeUser);

  return {
    token,
    user: safeUser,
  };
}

async function logout() {
  return null;
}

async function getCurrentUser(userId) {
  const user = await userRepository.findSafeById(userId);
  if (!user || !user.is_active) {
    throw createError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  return { user: toSafeUser(user) };
}

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role,
  };
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
};
