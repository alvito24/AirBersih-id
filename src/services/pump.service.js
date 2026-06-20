const pumpRepository = require('../repositories/pump.repository');
const {
  PUMP_COMMAND,
  PUMP_COMMAND_SOURCE,
  PUMP_DEVICE_STATUS,
  PUMP_LOG_SOURCE,
  PUBLISH_STATUS,
} = require('../utils/constants');

const allowedCommands = Object.values(PUMP_COMMAND);
const allowedStatuses = Object.values(PUMP_DEVICE_STATUS);
const allowedStatusSources = [PUMP_LOG_SOURCE.AUTO, PUMP_LOG_SOURCE.MANUAL, PUMP_LOG_SOURCE.SYSTEM];

function validatePumpCommand(command) {
  if (!allowedCommands.includes(command)) {
    const error = new Error('Invalid pump command');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = [{ field: 'command', message: 'command must be ON or OFF' }];
    throw error;
  }
}

function validatePumpStatusPayload(payload) {
  const details = [];
  const pumpCode = typeof payload.pump_id === 'string' ? payload.pump_id.trim() : '';
  const status = typeof payload.status === 'string' ? payload.status.trim() : '';
  const source = typeof payload.source === 'string' ? payload.source.trim() : PUMP_LOG_SOURCE.MQTT;

  if (!pumpCode) {
    details.push({ field: 'pump_id', message: 'pump_id is required and must be a string' });
  }

  if (!allowedStatuses.includes(status)) {
    details.push({ field: 'status', message: `status must be one of: ${allowedStatuses.join(', ')}` });
  }

  if (payload.source !== undefined && !allowedStatusSources.includes(source)) {
    details.push({ field: 'source', message: `source must be one of: ${allowedStatusSources.join(', ')}` });
  }

  return {
    isValid: details.length === 0,
    details,
    value: { pumpCode, status, source },
  };
}

function toPumpLogDto(log) {
  if (!log) {
    return null;
  }

  return {
    id: log.id,
    pump_code: log.pump_code,
    command: log.command,
    status: log.status,
    source: log.source,
    command_source: log.command_source,
    publish_status: log.publish_status,
    operator_user_id: log.operator_user_id,
    raw_payload: log.raw_payload,
    received_at: log.received_at,
    created_at: log.created_at,
  };
}

async function getPumpOrThrow(pumpCode) {
  const pump = await pumpRepository.findPumpByCode(pumpCode);
  if (!pump) {
    const error = new Error(`Pump ${pumpCode} not found`);
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    error.details = [{ field: 'pump_code', message: 'Pump is not registered' }];
    throw error;
  }

  return pump;
}

async function controlPump({ pumpCode, command, operatorUserId, publishPumpCommand }) {
  validatePumpCommand(command);
  const pump = await getPumpOrThrow(pumpCode);
  const publishResult = await publishPumpCommand(pumpCode, command);

  const log = await pumpRepository.insertPumpOperationLog({
    pumpId: pump.id,
    command,
    status: null,
    source: PUMP_LOG_SOURCE.WEB,
    rawPayload: {
      request: { command },
      topic: publishResult.topic,
      payload: { command },
    },
    operatorUserId,
    commandSource: PUMP_COMMAND_SOURCE.WEB,
    publishStatus: PUBLISH_STATUS.SENT,
  });

  await pumpRepository.updateLastCommandAt(pump.id);

  return {
    pump_code: pump.pump_code,
    command,
    publish_status: PUBLISH_STATUS.SENT,
    topic: publishResult.topic,
    log: toPumpLogDto({ ...log, pump_code: pump.pump_code }),
  };
}

async function ingestPumpStatus(payload) {
  const validation = validatePumpStatusPayload(payload);
  if (!validation.isValid) {
    const error = new Error('Invalid pump status payload');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = validation.details;
    throw error;
  }

  const pump = await getPumpOrThrow(validation.value.pumpCode);
  const log = await pumpRepository.insertPumpOperationLog({
    pumpId: pump.id,
    command: null,
    status: validation.value.status,
    source: validation.value.source,
    rawPayload: payload,
    operatorUserId: null,
    commandSource: null,
    publishStatus: null,
  });

  await pumpRepository.updatePumpConfirmedStatus({
    pumpId: pump.id,
    status: validation.value.status,
  });

  return toPumpLogDto({ ...log, pump_code: pump.pump_code });
}

async function getPumpStatus(pumpCode) {
  const pump = await getPumpOrThrow(pumpCode);
  const latestStatus = await pumpRepository.findLatestPumpStatusLog(pump.pump_code);

  return {
    pump_code: pump.pump_code,
    current_status: pump.current_status,
    last_command_at: pump.last_command_at,
    last_confirmed_at: pump.last_confirmed_at,
    latest_status_log: toPumpLogDto(latestStatus),
  };
}

async function getPumpLogs(pumpCode) {
  const pump = await getPumpOrThrow(pumpCode);
  const logs = await pumpRepository.findPumpLogs(pump.pump_code);
  return logs.map(toPumpLogDto);
}

module.exports = {
  validatePumpCommand,
  validatePumpStatusPayload,
  controlPump,
  ingestPumpStatus,
  getPumpStatus,
  getPumpLogs,
};
