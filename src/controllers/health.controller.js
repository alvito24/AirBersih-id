const { successResponse } = require('../utils/apiResponse');
const { APP_NAME } = require('../utils/constants');

function getHealth(req, res) {
  return successResponse(res, 200, 'Backend is running', {
    service: APP_NAME,
    status: 'OK',
  });
}

module.exports = {
  getHealth,
};
