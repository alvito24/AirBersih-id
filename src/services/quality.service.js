const qualityRepository = require('../repositories/quality.repository');
const alertService = require('./alert.service');
const { QUALITY_STATUS, READING_SOURCE } = require('../utils/constants');

const allowedStatusCategories = Object.values(QUALITY_STATUS);

function validateQualityPayload(payload) {
  const details = [];
  const nodeId = typeof payload.node_id === 'string' ? payload.node_id.trim() : '';
  const turbidityRaw = payload.turbidity_raw;
  const statusCategory = typeof payload.status_category === 'string' ? payload.status_category.trim() : '';
  const timestamp = payload.timestamp === undefined ? null : payload.timestamp;

  if (!nodeId) {
    details.push({ field: 'node_id', message: 'node_id is required and must be a string' });
  }

  if (typeof turbidityRaw !== 'number' || Number.isNaN(turbidityRaw)) {
    details.push({ field: 'turbidity_raw', message: 'turbidity_raw is required and must be a number' });
  }

  if (!allowedStatusCategories.includes(statusCategory)) {
    details.push({
      field: 'status_category',
      message: `status_category must be one of: ${allowedStatusCategories.join(', ')}`,
    });
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
      nodeId,
      turbidityRaw,
      statusCategory,
      recordedAt,
    },
  };
}

function toQualityReadingDto(reading) {
  if (!reading) {
    return null;
  }

  return {
    id: reading.id,
    node_id: reading.node_code,
    location_name: reading.location_name,
    turbidity_raw: reading.turbidity_raw,
    turbidity_ntu: reading.turbidity_ntu,
    water_temp_celsius: reading.water_temp_celsius,
    status_category: reading.status_category,
    source: reading.source,
    recorded_at: reading.recorded_at,
    received_at: reading.received_at,
  };
}

async function ingestQualityReading(payload, source = READING_SOURCE.REST) {
  const validation = validateQualityPayload(payload);
  if (!validation.isValid) {
    const error = new Error('Invalid quality payload');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = validation.details;
    throw error;
  }

  const node = await qualityRepository.findSensorNodeByCode(validation.value.nodeId);
  if (!node) {
    const error = new Error(`Sensor node ${validation.value.nodeId} not found`);
    error.statusCode = 404;
    error.code = 'NODE_NOT_FOUND';
    error.details = [{ field: 'node_id', message: 'Sensor node is not registered or inactive' }];
    throw error;
  }

  const reading = await qualityRepository.insertQualityReading({
    nodeId: node.id,
    turbidityRaw: validation.value.turbidityRaw,
    statusCategory: validation.value.statusCategory,
    source,
    rawPayload: payload,
    recordedAt: validation.value.recordedAt,
  });

  await qualityRepository.updateSensorNodeLastPing(node.id);

  const readingDto = toQualityReadingDto({
    ...reading,
    node_code: node.node_code,
    location_name: node.location_name,
  });

  try {
    await alertService.triggerFromQualityReading({ node, reading: readingDto });
  } catch (error) {
    console.error('Quality alert trigger failed:', error.message);
  }

  return readingDto;
}

async function getCurrentQuality(nodeId) {
  if (!nodeId || typeof nodeId !== 'string') {
    const error = new Error('node_id query parameter is required');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = [{ field: 'node_id', message: 'node_id query parameter is required' }];
    throw error;
  }

  const nodeCode = nodeId.trim();
  const node = await qualityRepository.findSensorNodeByCode(nodeCode);
  if (!node) {
    const error = new Error(`Sensor node ${nodeCode} not found`);
    error.statusCode = 404;
    error.code = 'NODE_NOT_FOUND';
    error.details = [{ field: 'node_id', message: 'Sensor node is not registered or inactive' }];
    throw error;
  }

  const reading = await qualityRepository.findLatestQualityReading(nodeCode);
  return toQualityReadingDto(reading);
}

async function getQualityHistory({ nodeId, from, to }) {
  if (!nodeId || typeof nodeId !== 'string') {
    const error = new Error('node_id query parameter is required');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = [{ field: 'node_id', message: 'node_id query parameter is required' }];
    throw error;
  }

  const nodeCode = nodeId.trim();
  const dateErrors = [];

  if (from && Number.isNaN(new Date(from).getTime())) {
    dateErrors.push({ field: 'from', message: 'from must be a valid date' });
  }

  if (to && Number.isNaN(new Date(to).getTime())) {
    dateErrors.push({ field: 'to', message: 'to must be a valid date' });
  }

  if (dateErrors.length > 0) {
    const error = new Error('Invalid date filter');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = dateErrors;
    throw error;
  }

  const node = await qualityRepository.findSensorNodeByCode(nodeCode);
  if (!node) {
    const error = new Error(`Sensor node ${nodeCode} not found`);
    error.statusCode = 404;
    error.code = 'NODE_NOT_FOUND';
    error.details = [{ field: 'node_id', message: 'Sensor node is not registered or inactive' }];
    throw error;
  }

  const readings = await qualityRepository.findQualityHistory({ nodeCode, from, to });
  return readings.map(toQualityReadingDto);
}

module.exports = {
  validateQualityPayload,
  ingestQualityReading,
  getCurrentQuality,
  getQualityHistory,
};
