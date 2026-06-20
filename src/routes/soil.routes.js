const express = require('express');
const soilController = require('../controllers/soil.controller');
const authenticate = require('../middlewares/authenticate');
const authorizeRole = require('../middlewares/authorizeRole');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.get(
  '/soil/heatmap',
  authenticate,
  authorizeRole(ROLES.PENGURUS_RT_RW),
  soilController.getHeatmap,
);

router.get(
  '/soil/prediction',
  authenticate,
  authorizeRole(ROLES.PENGURUS_RT_RW),
  soilController.getPrediction,
);

module.exports = router;
