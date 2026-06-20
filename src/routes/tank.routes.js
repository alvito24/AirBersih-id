const express = require('express');
const tankController = require('../controllers/tank.controller');
const authenticate = require('../middlewares/authenticate');
const authorizeRole = require('../middlewares/authorizeRole');
const { ROLES } = require('../utils/constants');

const router = express.Router();
const activeMvpRoles = [ROLES.WARGA, ROLES.PENGURUS_RT_RW];

router.get(
  '/tanks/status',
  authenticate,
  authorizeRole(...activeMvpRoles),
  tankController.getTankStatus,
);

router.get(
  '/tanks/:tank_code/history',
  authenticate,
  authorizeRole(...activeMvpRoles),
  tankController.getTankHistory,
);

module.exports = router;
