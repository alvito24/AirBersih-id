const pumpService = require('../services/pump.service');
const mqttService = require('../services/mqtt.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { ERROR_CODES } = require('../utils/constants');

function handlePumpError(res, error) {
  const statusCode = error.statusCode || 500;
  const code = error.code || ERROR_CODES.INTERNAL_SERVER_ERROR;
  const details = error.details || [];
  const message = statusCode === 500 ? 'Internal server error' : error.message;

  return errorResponse(res, statusCode, message, code, details);
}

async function controlPump(req, res) {
  try {
    const result = await pumpService.controlPump({
      pumpCode: req.params.pump_code,
      command: req.body.command,
      operatorUserId: req.user.id,
      publishPumpCommand: mqttService.publishPumpCommand,
    });

    return successResponse(res, 200, 'Pump command published', result);
  } catch (error) {
    return handlePumpError(res, error);
  }
}

async function getPumpStatus(req, res) {
  try {
    const status = await pumpService.getPumpStatus(req.params.pump_code);
    return successResponse(res, 200, 'Pump status retrieved', status);
  } catch (error) {
    return handlePumpError(res, error);
  }
}

async function getPumpLogs(req, res) {
  try {
    const logs = await pumpService.getPumpLogs(req.params.pump_code);
    return successResponse(res, 200, 'Pump logs retrieved', {
      items: logs,
      total: logs.length,
    });
  } catch (error) {
    return handlePumpError(res, error);
  }
}

module.exports = {
  controlPump,
  getPumpStatus,
  getPumpLogs,
};
