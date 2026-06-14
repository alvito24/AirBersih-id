const express = require('express');
const authenticate = require('../middlewares/authenticate');
const authorizeRole = require('../middlewares/authorizeRole');
const { successResponse } = require('../utils/apiResponse');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.get('/warga-only', authenticate, authorizeRole(ROLES.WARGA), (req, res) => {
  return successResponse(res, 200, 'Warga access granted', null);
});

router.get('/rt-rw-only', authenticate, authorizeRole(ROLES.PENGURUS_RT_RW, ROLES.ADMIN_SISTEM), (req, res) => {
  return successResponse(res, 200, 'RT/RW access granted', null);
});

router.get('/admin-only', authenticate, authorizeRole(ROLES.ADMIN_SISTEM), (req, res) => {
  return successResponse(res, 200, 'Admin access granted', null);
});

router.get('/mitra-only', authenticate, authorizeRole(ROLES.MITRA_TUKANG), (req, res) => {
  return successResponse(res, 200, 'Mitra access granted', null);
});

module.exports = router;
