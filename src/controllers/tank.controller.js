const tankService = require('../services/tank.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { ERROR_CODES } = require('../utils/constants');

function handleTankError(res, error) {
  const statusCode = error.statusCode || 500;
  const code = error.code || ERROR_CODES.INTERNAL_SERVER_ERROR;
  const details = error.details || [];
  const message = statusCode === 500 ? 'Internal server error' : error.message;

  return errorResponse(res, statusCode, message, code, details);
}

async function getTankStatus(req, res) {
  try {
    const readings = await tankService.getTankStatus();
    return successResponse(res, 200, 'Tank status retrieved', {
      items: readings,
      total: readings.length,
    });
  } catch (error) {
    return handleTankError(res, error);
  }
}

async function getTankHistory(req, res) {
  try {
    const readings = await tankService.getTankHistory(req.params.tank_code);
    return successResponse(res, 200, 'Tank history retrieved', {
      items: readings,
      total: readings.length,
    });
  } catch (error) {
    return handleTankError(res, error);
  }
}

module.exports = {
  getTankStatus,
  getTankHistory,
};
