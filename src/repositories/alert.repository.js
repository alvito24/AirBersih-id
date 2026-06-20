const { query } = require('../config/db');

async function findOpenAlertByNodeId(nodeId) {
  const result = await query(
    `SELECT id, node_id, alert_type, alert_level, message, triggered_value,
       status, triggered_at, resolved_at, resolved_by_user_id
     FROM alerts
     WHERE node_id = $1 AND status IN ('ACTIVE', 'HANDLING')
     ORDER BY triggered_at DESC, id DESC
     LIMIT 1`,
    [nodeId],
  );

  return result.rows[0] || null;
}

async function createAlert({ nodeId, alertType, alertLevel, message, triggeredValue, triggeredAt }) {
  const result = await query(
    `INSERT INTO alerts (
       node_id,
       alert_type,
       alert_level,
       message,
       triggered_value,
       status,
       triggered_at
     )
     VALUES ($1, $2, $3, $4, $5, 'ACTIVE', COALESCE($6, NOW()))
     RETURNING id, node_id, alert_type, alert_level, message, triggered_value,
       status, triggered_at, resolved_at, resolved_by_user_id`,
    [nodeId, alertType, alertLevel, message, triggeredValue, triggeredAt],
  );

  return result.rows[0];
}

async function findActiveAlerts() {
  const result = await query(
    `SELECT a.id, a.node_id, sn.node_code, sn.location_name, a.alert_type,
       a.alert_level, a.message, a.triggered_value, a.status, a.triggered_at,
       a.resolved_at, a.resolved_by_user_id
     FROM alerts a
     LEFT JOIN sensor_nodes sn ON sn.id = a.node_id
     WHERE a.status IN ('ACTIVE', 'HANDLING')
     ORDER BY a.triggered_at DESC, a.id DESC`,
  );

  return result.rows;
}

async function findAlertHistory() {
  const result = await query(
    `SELECT a.id, a.node_id, sn.node_code, sn.location_name, a.alert_type,
       a.alert_level, a.message, a.triggered_value, a.status, a.triggered_at,
       a.resolved_at, a.resolved_by_user_id
     FROM alerts a
     LEFT JOIN sensor_nodes sn ON sn.id = a.node_id
     ORDER BY a.triggered_at DESC, a.id DESC`,
  );

  return result.rows;
}

async function findAlertById(id) {
  const result = await query(
    `SELECT id, node_id, alert_type, alert_level, message, triggered_value,
       status, triggered_at, resolved_at, resolved_by_user_id
     FROM alerts
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] || null;
}

async function updateAlertStatus({ id, status, resolvedByUserId }) {
  const result = await query(
    `UPDATE alerts
     SET status = $2,
       resolved_at = CASE WHEN $2 = 'RESOLVED' THEN NOW() ELSE NULL END,
       resolved_by_user_id = CASE WHEN $2 = 'RESOLVED' THEN $3 ELSE NULL END
     WHERE id = $1
     RETURNING id, node_id, alert_type, alert_level, message, triggered_value,
       status, triggered_at, resolved_at, resolved_by_user_id`,
    [id, status, resolvedByUserId],
  );

  return result.rows[0] || null;
}

module.exports = {
  findOpenAlertByNodeId,
  createAlert,
  findActiveAlerts,
  findAlertHistory,
  findAlertById,
  updateAlertStatus,
};
