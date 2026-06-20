const billingRepository = require('../repositories/billing.repository');
const { ERROR_CODES } = require('../utils/constants');

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundM3(value) {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

function throwConfigError(message, details = []) {
  const error = new Error(message);
  error.statusCode = 404;
  error.code = 'TARIFF_NOT_CONFIGURED';
  error.details = details;
  throw error;
}

async function getActiveTariffOrThrow() {
  const tariff = await billingRepository.findActiveTariff();

  if (!tariff) {
    throwConfigError('Active tariff config is not available', [
      { field: 'tariff_config', message: 'Seed or create an active tariff_config row first' },
    ]);
  }

  return {
    id: tariff.id,
    tariff_name: tariff.tariff_name,
    rate_per_m3: toNumber(tariff.rate_per_m3),
    is_active: tariff.is_active,
  };
}

function calculateBilling(row, tariff) {
  const totalLiters = toNumber(row.total_usage_liters);
  const totalM3 = roundM3(totalLiters / 1000);
  const totalAmount = roundMoney(totalM3 * tariff.rate_per_m3);

  return {
    total_liters: totalLiters,
    total_m3: totalM3,
    rate_per_m3: tariff.rate_per_m3,
    total_amount: totalAmount,
  };
}

function toBillingItem(row, tariff, includeUser = false) {
  const calculation = calculateBilling(row, tariff);
  const item = {
    connection_id: row.connection_id,
    connection_code: row.connection_code,
    location_name: row.location_name,
    summary_id: row.summary_id,
    billing_record_id: row.billing_record_id,
    period_month: row.period_month,
    period_year: row.period_year,
    total_liters: calculation.total_liters,
    total_m3: calculation.total_m3,
    rate_per_m3: calculation.rate_per_m3,
    total_amount: calculation.total_amount,
    billing_status: row.billing_status || 'UNISSUED',
    has_summary: Boolean(row.summary_id),
    summary_source: row.summary_source || null,
    issued_at: row.issued_at || null,
    paid_at: row.paid_at || null,
  };

  if (includeUser) {
    item.user = {
      id: row.user_id,
      name: row.user_name,
      email: row.user_email,
    };
  }

  return item;
}

function summarizeItems(items) {
  return items.reduce(
    (acc, item) => ({
      connections: acc.connections + 1,
      with_summary: acc.with_summary + (item.has_summary ? 1 : 0),
      total_liters: roundMoney(acc.total_liters + item.total_liters),
      total_m3: roundM3(acc.total_m3 + item.total_m3),
      total_amount: roundMoney(acc.total_amount + item.total_amount),
    }),
    { connections: 0, with_summary: 0, total_liters: 0, total_m3: 0, total_amount: 0 },
  );
}

async function getMyBilling({ userId, month, year }) {
  const tariff = await getActiveTariffOrThrow();
  const rows = await billingRepository.findUserBillingSummaries({ userId, month, year });
  const items = rows.map((row) => toBillingItem(row, tariff));

  return {
    period: { month, year },
    tariff,
    items,
    totals: summarizeItems(items),
  };
}

async function getBillingSummary({ month, year }) {
  const tariff = await getActiveTariffOrThrow();
  const rows = await billingRepository.findBillingSummary({ month, year });
  const items = rows.map((row) => toBillingItem(row, tariff, true));

  return {
    period: { month, year },
    tariff,
    totals: summarizeItems(items),
    items,
  };
}

async function exportBillingPdfPlaceholder({ billingId }) {
  const row = await billingRepository.findBillingRecordById(billingId);

  if (!row) {
    const error = new Error('Billing record not found');
    error.statusCode = 404;
    error.code = 'BILLING_NOT_FOUND';
    error.details = [{ field: 'id', message: 'Billing record does not exist' }];
    throw error;
  }

  const ratePerM3 = toNumber(row.recorded_rate_per_m3);
  const totalLiters = toNumber(row.summary_total_usage_liters, toNumber(row.total_usage_liters));
  const totalM3 = row.recorded_total_m3 !== null && row.recorded_total_m3 !== undefined
    ? toNumber(row.recorded_total_m3)
    : roundM3(totalLiters / 1000);
  const totalAmount = row.recorded_total_amount !== null && row.recorded_total_amount !== undefined
    ? toNumber(row.recorded_total_amount)
    : roundMoney(totalM3 * ratePerM3);

  return {
    billing_record_id: row.billing_record_id,
    export_status: 'PLACEHOLDER',
    content_type: 'application/json',
    todo: 'Generate real PDF after PDF dependency is approved',
    billing: {
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
      },
      connection: {
        id: row.connection_id,
        code: row.connection_code,
        location_name: row.location_name,
      },
      period: {
        month: row.period_month,
        year: row.period_year,
      },
      total_liters: totalLiters,
      total_m3: totalM3,
      rate_per_m3: ratePerM3,
      total_amount: totalAmount,
      status: row.billing_status,
      issued_at: row.issued_at,
      paid_at: row.paid_at,
      summary_source: row.summary_source || null,
    },
  };
}

module.exports = {
  getMyBilling,
  getBillingSummary,
  exportBillingPdfPlaceholder,
};
