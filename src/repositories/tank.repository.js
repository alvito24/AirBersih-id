const { query } = require('../config/db');

async function findTankByCode(tankCode) {
  const result = await query(
    `SELECT id, tank_code, location_name, is_active
     FROM water_tanks
     WHERE tank_code = $1 AND is_active = TRUE`,
    [tankCode],
  );

  return result.rows[0] || null;
}

async function insertTankLevelReading({ tankId, waterLevelRaw, pumpStatus, source, rawPayload, recordedAt }) {
  const result = await query(
    `INSERT INTO tank_level_readings (
       tank_id,
       water_level_raw,
       pump_status,
       source,
       raw_payload,
       recorded_at,
       received_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING id, tank_id, water_level_raw, pump_status, source, raw_payload,
       recorded_at, received_at, created_at`,
    [tankId, waterLevelRaw, pumpStatus, source, rawPayload, recordedAt],
  );

  return result.rows[0];
}

async function findLatestTankReadings() {
  const result = await query(
    `SELECT DISTINCT ON (wt.id)
       tlr.id,
       wt.tank_code,
       wt.location_name,
       tlr.water_level_raw,
       tlr.pump_status,
       tlr.source,
       tlr.recorded_at,
       tlr.received_at
     FROM water_tanks wt
     JOIN tank_level_readings tlr ON tlr.tank_id = wt.id
     WHERE wt.is_active = TRUE
     ORDER BY wt.id, tlr.received_at DESC, tlr.id DESC`,
  );

  return result.rows;
}

async function findTankHistory(tankCode) {
  const result = await query(
    `SELECT
       tlr.id,
       wt.tank_code,
       wt.location_name,
       tlr.water_level_raw,
       tlr.pump_status,
       tlr.source,
       tlr.recorded_at,
       tlr.received_at
     FROM tank_level_readings tlr
     JOIN water_tanks wt ON wt.id = tlr.tank_id
     WHERE wt.tank_code = $1
     ORDER BY tlr.received_at DESC, tlr.id DESC`,
    [tankCode],
  );

  return result.rows;
}

module.exports = {
  findTankByCode,
  insertTankLevelReading,
  findLatestTankReadings,
  findTankHistory,
};
