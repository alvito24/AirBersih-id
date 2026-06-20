const billingService = require('../services/billing.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { ERROR_CODES } = require('../utils/constants');

function parseBillingPeriod(query) {
  const month = Number(query.month);
  const year = Number(query.year);
  const details = [];

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    details.push({ field: 'month', message: 'month must be an integer between 1 and 12' });
  }

  if (!Number.isInteger(year) || year < 2020 || year > 2100) {
    details.push({ field: 'year', message: 'year must be an integer between 2020 and 2100' });
  }

  if (details.length > 0) {
    const error = new Error('Invalid billing period');
    error.statusCode = 400;
    error.code = ERROR_CODES.VALIDATION_ERROR;
    error.details = details;
    throw error;
  }

  return { month, year };
}

function handleBillingError(res, error) {
  const statusCode = error.statusCode || 500;
  const code = error.code || ERROR_CODES.INTERNAL_SERVER_ERROR;
  const details = error.details || [];
  const message = statusCode === 500 ? 'Internal server error' : error.message;

  return errorResponse(res, statusCode, message, code, details);
}

async function getMyBilling(req, res) {
  try {
    const period = parseBillingPeriod(req.query);
    const result = await billingService.getMyBilling({
      userId: req.user.id,
      ...period,
    });

    return successResponse(res, 200, 'Billing retrieved', result);
  } catch (error) {
    return handleBillingError(res, error);
  }
}

async function getBillingSummary(req, res) {
  try {
    const period = parseBillingPeriod(req.query);
    const result = await billingService.getBillingSummary(period);

    return successResponse(res, 200, 'Billing summary retrieved', result);
  } catch (error) {
    return handleBillingError(res, error);
  }
}

async function exportBillingPdf(req, res) {
  try {
    const billingId = Number(req.params.id);

    if (!Number.isInteger(billingId) || billingId < 1) {
      return errorResponse(
        res,
        400,
        'Invalid billing id',
        ERROR_CODES.VALIDATION_ERROR,
        [{ field: 'id', message: 'id must be a positive integer' }],
      );
    }

    const result = await billingService.exportBillingPdfPlaceholder({ billingId });
    return successResponse(res, 200, 'PDF export placeholder retrieved', result);
  } catch (error) {
    return handleBillingError(res, error);
  }
}

module.exports = {
  getMyBilling,
  getBillingSummary,
  exportBillingPdf,
};
