const express = require('express');
const pumpController = require('../controllers/pump.controller');
const authenticate = require('../middlewares/authenticate');
const authorizeRole = require('../middlewares/authorizeRole');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.post(
  '/pumps/:pump_code/control',
  authenticate,
  authorizeRole(ROLES.PENGURUS_RT_RW),
  pumpController.controlPump,
);

router.get(
  '/pumps/:pump_code/status',
  authenticate,
  authorizeRole(ROLES.PENGURUS_RT_RW),
  pumpController.getPumpStatus,
);

router.get(
  '/pumps/:pump_code/logs',
  authenticate,
  authorizeRole(ROLES.PENGURUS_RT_RW),
  pumpController.getPumpLogs,
);

module.exports = router;
