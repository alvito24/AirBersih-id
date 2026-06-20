const { query } = require('../config/db');

async function findPumpByCode(pumpCode) {
  const result = await query(
    `SELECT id, pump_code, current_status, last_command_at, last_confirmed_at
     FROM pumps
     WHERE pump_code = $1`,
    [pumpCode],
  );

  return result.rows[0] || null;
}

async function insertPumpOperationLog({
  pumpId,
  command,
  status,
  source,
  rawPayload,
  operatorUserId,
  commandSource,
  publishStatus,
}) {
  const result = await query(
    `INSERT INTO pump_operation_logs (
       pump_id,
       command,
       status,
       source,
       raw_payload,
       operator_user_id,
       command_source,
       publish_status,
       received_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING id, pump_id, command, status, source, raw_payload, operator_user_id,
       command_source, publish_status, received_at, created_at`,
    [pumpId, command, status, source, rawPayload, operatorUserId, commandSource, publishStatus],
  );

  return result.rows[0];
}

async function updateLastCommandAt(pumpId) {
  await query(
    `UPDATE pumps
     SET last_command_at = NOW()
     WHERE id = $1`,
    [pumpId],
  );
}

async function updatePumpConfirmedStatus({ pumpId, status }) {
  await query(
    `UPDATE pumps
     SET current_status = $2,
       last_confirmed_at = NOW()
     WHERE id = $1`,
    [pumpId, status],
  );
}

async function findLatestPumpStatusLog(pumpCode) {
  const result = await query(
    `SELECT pol.id, p.pump_code, p.current_status, pol.command, pol.status,
       pol.source, pol.command_source, pol.publish_status, pol.operator_user_id,
       pol.raw_payload, pol.received_at, pol.created_at
     FROM pump_operation_logs pol
     JOIN pumps p ON p.id = pol.pump_id
     WHERE p.pump_code = $1 AND pol.status IS NOT NULL
     ORDER BY pol.received_at DESC, pol.id DESC
     LIMIT 1`,
    [pumpCode],
  );

  return result.rows[0] || null;
}

async function findPumpLogs(pumpCode) {
  const result = await query(
    `SELECT pol.id, p.pump_code, pol.command, pol.status, pol.source,
       pol.command_source, pol.publish_status, pol.operator_user_id,
       pol.raw_payload, pol.received_at, pol.created_at
     FROM pump_operation_logs pol
     JOIN pumps p ON p.id = pol.pump_id
     WHERE p.pump_code = $1
     ORDER BY pol.received_at DESC, pol.id DESC`,
    [pumpCode],
  );

  return result.rows;
}

module.exports = {
  findPumpByCode,
  insertPumpOperationLog,
  updateLastCommandAt,
  updatePumpConfirmedStatus,
  findLatestPumpStatusLog,
  findPumpLogs,
};
