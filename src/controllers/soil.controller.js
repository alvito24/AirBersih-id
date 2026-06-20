const soilAnalysisService = require('../services/soilAnalysis.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { ERROR_CODES } = require('../utils/constants');

function handleSoilError(res, error) {
  const statusCode = error.statusCode || 500;
  const code = error.code || ERROR_CODES.INTERNAL_SERVER_ERROR;
  const details = error.details || [];
  const message = statusCode === 500 ? 'Internal server error' : error.message;

  return errorResponse(res, statusCode, message, code, details);
}

async function getHeatmap(req, res) {
  try {
    const heatmap = await soilAnalysisService.getHeatmap();
    return successResponse(res, 200, 'Soil heatmap retrieved', heatmap);
  } catch (error) {
    return handleSoilError(res, error);
  }
}

async function getPrediction(req, res) {
  try {
    const prediction = await soilAnalysisService.getPrediction();
    return successResponse(res, 200, 'Soil prediction retrieved', prediction);
  } catch (error) {
    return handleSoilError(res, error);
  }
}

module.exports = {
  getHeatmap,
  getPrediction,
};
