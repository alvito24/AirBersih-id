const express = require('express');
const billingController = require('../controllers/billing.controller');
const authenticate = require('../middlewares/authenticate');
const authorizeRole = require('../middlewares/authorizeRole');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.get(
  '/billing/my',
  authenticate,
  authorizeRole(ROLES.WARGA),
  billingController.getMyBilling,
);

router.get(
  '/billing/summary',
  authenticate,
  authorizeRole(ROLES.PENGURUS_RT_RW),
  billingController.getBillingSummary,
);

router.get(
  '/billing/:id/export-pdf',
  authenticate,
  authorizeRole(ROLES.PENGURUS_RT_RW),
  billingController.exportBillingPdf,
);

module.exports = router;
