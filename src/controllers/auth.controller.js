const authService = require('../services/auth.service');
const { successResponse } = require('../utils/apiResponse');

async function register(req, res, next) {
  try {
    const data = await authService.register(req.body);
    return successResponse(res, 201, 'Register berhasil', data);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const data = await authService.login(req.body);
    return successResponse(res, 200, 'Login berhasil', data);
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res, next) {
  try {
    const data = await authService.logout();
    return successResponse(res, 200, 'Logout berhasil', data);
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const data = await authService.getCurrentUser(req.user.id);
    return successResponse(res, 200, 'Current user retrieved', data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  me,
};
