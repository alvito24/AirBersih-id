const tankRepository = require('../repositories/tank.repository');
const { PUMP_STATUS, READING_SOURCE, TANK_RAW_STATUS } = require('../utils/constants');

const allowedPumpStatuses = Object.values(PUMP_STATUS);

function getRawTankStatus(waterLevelRaw) {
  if (waterLevelRaw <= 300) {
    return TANK_RAW_STATUS.LOW;
  }

  if (waterLevelRaw >= 800) {
    return TANK_RAW_STATUS.FULL;
  }

  return TANK_RAW_STATUS.NORMAL;
}

function validateTankPayload(payload) {
  const details = [];
  const tankCode = typeof payload.tank_id === 'string' ? payload.tank_id.trim() : '';
  const waterLevelRaw = payload.water_level;
  const pumpStatus = typeof payload.pump_status === 'string' ? payload.pump_status.trim() : '';
  const timestamp = payload.timestamp === undefined ? null : payload.timestamp;

  if (!tankCode) {
    details.push({ field: 'tank_id', message: 'tank_id is required and must be a string' });
  }

  if (typeof waterLevelRaw !== 'number' || Number.isNaN(waterLevelRaw)) {
    details.push({ field: 'water_level', message: 'water_level is required and must be a number' });
  }

  if (!allowedPumpStatuses.includes(pumpStatus)) {
    details.push({ field: 'pump_status', message: `pump_status must be one of: ${allowedPumpStatuses.join(', ')}` });
  }

  if (timestamp !== null && typeof timestamp !== 'string' && typeof timestamp !== 'number') {
    details.push({ field: 'timestamp', message: 'timestamp must be a string, number, or null' });
  }

  let recordedAt = null;
  if (timestamp !== null && timestamp !== undefined && timestamp !== '') {
    const parsedDate = new Date(timestamp);
    if (Number.isNaN(parsedDate.getTime())) {
      details.push({ field: 'timestamp', message: 'timestamp must be a valid date when provided' });
    } else {
      recordedAt = parsedDate;
    }
  }

  return {
    isValid: details.length === 0,
    details,
    value: {
      tankCode,
      waterLevelRaw,
      pumpStatus,
      recordedAt,
    },
  };
}

function toTankReadingDto(reading) {
  if (!reading) {
    return null;
  }

  return {
    id: reading.id,
    tank_code: reading.tank_code,
    location_name: reading.location_name,
    water_level_raw: reading.water_level_raw,
    raw_status: getRawTankStatus(reading.water_level_raw),
    pump_status: reading.pump_status,
    source: reading.source,
    recorded_at: reading.recorded_at,
    received_at: reading.received_at,
  };
}

async function ingestTankReading(payload, source = READING_SOURCE.MQTT) {
  const validation = validateTankPayload(payload);
  if (!validation.isValid) {
    const error = new Error('Invalid tank payload');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = validation.details;
    throw error;
  }

  const tank = await tankRepository.findTankByCode(validation.value.tankCode);
  if (!tank) {
    const error = new Error(`Tank ${validation.value.tankCode} not found`);
    error.statusCode = 404;
    error.code = 'TANK_NOT_FOUND';
    error.details = [{ field: 'tank_id', message: 'Tank is not registered or inactive' }];
    throw error;
  }

  const reading = await tankRepository.insertTankLevelReading({
    tankId: tank.id,
    waterLevelRaw: validation.value.waterLevelRaw,
    pumpStatus: validation.value.pumpStatus,
    source,
    rawPayload: payload,
    recordedAt: validation.value.recordedAt,
  });

  return toTankReadingDto({
    ...reading,
    tank_code: tank.tank_code,
    location_name: tank.location_name,
  });
}

async function getTankStatus() {
  const readings = await tankRepository.findLatestTankReadings();
  return readings.map(toTankReadingDto);
}

async function getTankHistory(tankCode) {
  if (!tankCode || typeof tankCode !== 'string') {
    const error = new Error('tank_code path parameter is required');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = [{ field: 'tank_code', message: 'tank_code path parameter is required' }];
    throw error;
  }

  const tank = await tankRepository.findTankByCode(tankCode.trim());
  if (!tank) {
    const error = new Error(`Tank ${tankCode} not found`);
    error.statusCode = 404;
    error.code = 'TANK_NOT_FOUND';
    error.details = [{ field: 'tank_code', message: 'Tank is not registered or inactive' }];
    throw error;
  }

  const readings = await tankRepository.findTankHistory(tank.tank_code);
  return readings.map(toTankReadingDto);
}

module.exports = {
  validateTankPayload,
  getRawTankStatus,
  ingestTankReading,
  getTankStatus,
  getTankHistory,
};
