const express = require('express');
const alertController = require('../controllers/alert.controller');
const authenticate = require('../middlewares/authenticate');
const authorizeRole = require('../middlewares/authorizeRole');
const { ROLES } = require('../utils/constants');

const router = express.Router();
const activeMvpRoles = [ROLES.WARGA, ROLES.PENGURUS_RT_RW];

router.get(
  '/alerts/active',
  authenticate,
  authorizeRole(...activeMvpRoles),
  alertController.getActiveAlerts,
);

router.get(
  '/alerts/history',
  authenticate,
  authorizeRole(...activeMvpRoles),
  alertController.getAlertHistory,
);

router.patch(
  '/alerts/:id/status',
  authenticate,
  authorizeRole(ROLES.PENGURUS_RT_RW),
  alertController.updateAlertStatus,
);

module.exports = router;
