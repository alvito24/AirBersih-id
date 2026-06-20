const env = require('../config/env');
const qualityService = require('../services/quality.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { ERROR_CODES, READING_SOURCE } = require('../utils/constants');

function handleQualityError(res, error) {
  const statusCode = error.statusCode || 500;
  const code = error.code || ERROR_CODES.INTERNAL_SERVER_ERROR;
  const details = error.details || [];
  const message = statusCode === 500 ? 'Internal server error' : error.message;

  return errorResponse(res, statusCode, message, code, details);
}

function validateDeviceApiKey(req, res) {
  if (!env.deviceApiKey) {
    return errorResponse(
      res,
      500,
      'Device API key is not configured',
      ERROR_CODES.INTERNAL_SERVER_ERROR,
    );
  }

  const apiKey = req.get('X-API-Key');
  if (apiKey !== env.deviceApiKey) {
    return errorResponse(res, 401, 'Invalid device API key', ERROR_CODES.TOKEN_INVALID);
  }

  return null;
}

async function createSensorReading(req, res) {
  const authError = validateDeviceApiKey(req, res);
  if (authError) {
    return authError;
  }

  try {
    const reading = await qualityService.ingestQualityReading(req.body, READING_SOURCE.REST);
    return successResponse(res, 201, 'Quality reading stored', reading);
  } catch (error) {
    return handleQualityError(res, error);
  }
}

async function getCurrentQuality(req, res) {
  try {
    const reading = await qualityService.getCurrentQuality(req.query.node_id);
    return successResponse(res, 200, 'Current quality reading retrieved', reading);
  } catch (error) {
    return handleQualityError(res, error);
  }
}

async function getQualityHistory(req, res) {
  try {
    const readings = await qualityService.getQualityHistory({
      nodeId: req.query.node_id,
      from: req.query.from,
      to: req.query.to,
    });

    return successResponse(res, 200, 'Quality history retrieved', {
      items: readings,
      total: readings.length,
    });
  } catch (error) {
    return handleQualityError(res, error);
  }
}

module.exports = {
  createSensorReading,
  getCurrentQuality,
  getQualityHistory,
};
