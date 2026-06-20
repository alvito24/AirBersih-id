const { query } = require('../config/db');

async function findActiveTariff() {
  const result = await query(
    `SELECT id, tariff_name, rate_per_m3, is_active, created_at
     FROM tariff_config
     WHERE is_active = TRUE
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
  );

  return result.rows[0] || null;
}

async function findUserBillingSummaries({ userId, month, year }) {
  const result = await query(
    `SELECT wc.id AS connection_id, wc.connection_code, wc.location_name,
       mcs.id AS summary_id, mcs.period_month, mcs.period_year,
       mcs.total_usage_liters, mcs.source AS summary_source,
       br.id AS billing_record_id, br.total_amount AS recorded_total_amount,
       br.rate_per_m3 AS recorded_rate_per_m3, br.total_m3 AS recorded_total_m3,
       br.status AS billing_status, br.issued_at, br.paid_at
     FROM water_connections wc
     LEFT JOIN monthly_consumption_summaries mcs
       ON mcs.connection_id = wc.id
       AND mcs.period_month = $2
       AND mcs.period_year = $3
     LEFT JOIN billing_records br
       ON br.connection_id = wc.id
       AND br.period_month = $2
       AND br.period_year = $3
     WHERE wc.user_id = $1
       AND wc.is_active = TRUE
     ORDER BY wc.id ASC`,
    [userId, month, year],
  );

  return result.rows;
}

async function findBillingSummary({ month, year }) {
  const result = await query(
    `SELECT wc.id AS connection_id, wc.connection_code, wc.location_name, wc.user_id,
       u.name AS user_name, u.email AS user_email,
       mcs.id AS summary_id, mcs.period_month, mcs.period_year,
       mcs.total_usage_liters, mcs.source AS summary_source,
       br.id AS billing_record_id, br.total_amount AS recorded_total_amount,
       br.rate_per_m3 AS recorded_rate_per_m3, br.total_m3 AS recorded_total_m3,
       br.status AS billing_status, br.issued_at, br.paid_at
     FROM water_connections wc
     JOIN users u ON u.id = wc.user_id
     LEFT JOIN monthly_consumption_summaries mcs
       ON mcs.connection_id = wc.id
       AND mcs.period_month = $1
       AND mcs.period_year = $2
     LEFT JOIN billing_records br
       ON br.connection_id = wc.id
       AND br.period_month = $1
       AND br.period_year = $2
     WHERE wc.is_active = TRUE
     ORDER BY wc.id ASC`,
    [month, year],
  );

  return result.rows;
}

async function findBillingRecordById(billingId) {
  const result = await query(
    `SELECT br.id AS billing_record_id, br.user_id, u.name AS user_name, u.email AS user_email,
       br.period_month, br.period_year, br.total_usage_liters,
       br.total_amount AS recorded_total_amount, br.status AS billing_status,
       br.issued_at, br.paid_at, br.connection_id, br.summary_id,
       br.rate_per_m3 AS recorded_rate_per_m3, br.total_m3 AS recorded_total_m3,
       wc.connection_code, wc.location_name,
       mcs.total_usage_liters AS summary_total_usage_liters,
       mcs.source AS summary_source
     FROM billing_records br
     JOIN users u ON u.id = br.user_id
     LEFT JOIN water_connections wc ON wc.id = br.connection_id
     LEFT JOIN monthly_consumption_summaries mcs ON mcs.id = br.summary_id
     WHERE br.id = $1`,
    [billingId],
  );

  return result.rows[0] || null;
}

module.exports = {
  findActiveTariff,
  findUserBillingSummaries,
  findBillingSummary,
  findBillingRecordById,
};
