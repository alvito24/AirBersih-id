const express = require('express');
const qualityController = require('../controllers/quality.controller');
const authenticate = require('../middlewares/authenticate');
const authorizeRole = require('../middlewares/authorizeRole');
const { ROLES } = require('../utils/constants');

const router = express.Router();
const activeMvpRoles = [ROLES.WARGA, ROLES.PENGURUS_RT_RW];

router.post('/sensor/reading', qualityController.createSensorReading);

router.get(
  '/quality/current',
  authenticate,
  authorizeRole(...activeMvpRoles),
  qualityController.getCurrentQuality,
);

router.get(
  '/quality/history',
  authenticate,
  authorizeRole(...activeMvpRoles),
  qualityController.getQualityHistory,
);

module.exports = router;
