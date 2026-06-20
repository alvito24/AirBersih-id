const alertService = require('../services/alert.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { ERROR_CODES } = require('../utils/constants');

function handleAlertError(res, error) {
  const statusCode = error.statusCode || 500;
  const code = error.code || ERROR_CODES.INTERNAL_SERVER_ERROR;
  const details = error.details || [];
  const message = statusCode === 500 ? 'Internal server error' : error.message;

  return errorResponse(res, statusCode, message, code, details);
}

async function getActiveAlerts(req, res) {
  try {
    const alerts = await alertService.getActiveAlerts();
    return successResponse(res, 200, 'Active alerts retrieved', {
      items: alerts,
      total: alerts.length,
    });
  } catch (error) {
    return handleAlertError(res, error);
  }
}

async function getAlertHistory(req, res) {
  try {
    const alerts = await alertService.getAlertHistory();
    return successResponse(res, 200, 'Alert history retrieved', {
      items: alerts,
      total: alerts.length,
    });
  } catch (error) {
    return handleAlertError(res, error);
  }
}

async function updateAlertStatus(req, res) {
  try {
    const alert = await alertService.updateAlertStatus({
      id: req.params.id,
      status: req.body.status,
      userId: req.user.id,
    });

    return successResponse(res, 200, 'Alert status updated', alert);
  } catch (error) {
    return handleAlertError(res, error);
  }
}

module.exports = {
  getActiveAlerts,
  getAlertHistory,
  updateAlertStatus,
};
