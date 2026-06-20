const { query } = require('../config/db');

async function findSensorNodeByCode(nodeCode) {
  const result = await query(
    `SELECT id, node_code, node_type, location_name, last_ping_at
     FROM sensor_nodes
     WHERE node_code = $1 AND is_active = TRUE`,
    [nodeCode],
  );

  return result.rows[0] || null;
}

async function insertQualityReading({ nodeId, turbidityRaw, statusCategory, source, rawPayload, recordedAt }) {
  const result = await query(
    `INSERT INTO water_quality_readings (
       node_id,
       turbidity_raw,
       status_category,
       source,
       raw_payload,
       recorded_at,
       received_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING id, node_id, turbidity_raw, turbidity_ntu, water_temp_celsius,
       status_category, source, raw_payload, recorded_at, received_at`,
    [nodeId, turbidityRaw, statusCategory, source, rawPayload, recordedAt],
  );

  return result.rows[0];
}

async function updateSensorNodeLastPing(nodeId) {
  await query(
    `UPDATE sensor_nodes
     SET last_ping_at = NOW()
     WHERE id = $1`,
    [nodeId],
  );
}

async function findLatestQualityReading(nodeCode) {
  const result = await query(
    `SELECT
       wqr.id,
       sn.node_code,
       sn.location_name,
       wqr.turbidity_raw,
       wqr.turbidity_ntu,
       wqr.water_temp_celsius,
       wqr.status_category,
       wqr.source,
       wqr.recorded_at,
       wqr.received_at
     FROM water_quality_readings wqr
     JOIN sensor_nodes sn ON sn.id = wqr.node_id
     WHERE sn.node_code = $1
     ORDER BY wqr.received_at DESC, wqr.id DESC
     LIMIT 1`,
    [nodeCode],
  );

  return result.rows[0] || null;
}

async function findQualityHistory({ nodeCode, from, to }) {
  const params = [nodeCode];
  const conditions = ['sn.node_code = $1'];

  if (from) {
    params.push(from);
    conditions.push(`wqr.received_at >= $${params.length}`);
  }

  if (to) {
    params.push(to);
    conditions.push(`wqr.received_at < ($${params.length}::date + INTERVAL '1 day')`);
  }

  const result = await query(
    `SELECT
       wqr.id,
       sn.node_code,
       sn.location_name,
       wqr.turbidity_raw,
       wqr.turbidity_ntu,
       wqr.water_temp_celsius,
       wqr.status_category,
       wqr.source,
       wqr.recorded_at,
       wqr.received_at
     FROM water_quality_readings wqr
     JOIN sensor_nodes sn ON sn.id = wqr.node_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY wqr.received_at DESC, wqr.id DESC`,
    params,
  );

  return result.rows;
}

module.exports = {
  findSensorNodeByCode,
  insertQualityReading,
  updateSensorNodeLastPing,
  findLatestQualityReading,
  findQualityHistory,
};
