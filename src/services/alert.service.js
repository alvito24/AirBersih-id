const alertRepository = require('../repositories/alert.repository');
const relayPublisher = require('./relayPublisher.service');
const {
  ALERT_LEVEL,
  ALERT_STATUS,
  ALERT_TYPE,
  QUALITY_STATUS,
} = require('../utils/constants');

function mapQualityStatusToAlertLevel(statusCategory) {
  const mapping = {
    [QUALITY_STATUS.MILD_TURBID]: ALERT_LEVEL.WARNING,
    [QUALITY_STATUS.TURBID]: ALERT_LEVEL.DANGER,
    [QUALITY_STATUS.UNSAFE]: ALERT_LEVEL.CRITICAL,
  };

  return mapping[statusCategory] || null;
}

function toAlertDto(alert) {
  if (!alert) {
    return null;
  }

  return {
    id: alert.id,
    node_id: alert.node_code || alert.node_id,
    location_name: alert.location_name,
    alert_type: alert.alert_type,
    alert_level: alert.alert_level,
    message: alert.message,
    triggered_value: alert.triggered_value,
    status: alert.status,
    triggered_at: alert.triggered_at,
    resolved_at: alert.resolved_at,
    resolved_by_user_id: alert.resolved_by_user_id,
  };
}

async function triggerFromQualityReading({ node, reading }) {
  if (!reading || reading.status_category !== QUALITY_STATUS.UNSAFE) {
    return { created: false, reason: 'QUALITY_STATUS_NOT_UNSAFE' };
  }

  const existingAlert = await alertRepository.findOpenAlertByNodeId(node.id);
  if (existingAlert) {
    return { created: false, reason: 'OPEN_ALERT_EXISTS', alert: toAlertDto(existingAlert) };
  }

  const alertLevel = mapQualityStatusToAlertLevel(reading.status_category);
  const alert = await alertRepository.createAlert({
    nodeId: node.id,
    alertType: ALERT_TYPE.WATER_QUALITY,
    alertLevel,
    message: `Kualitas air pada node ${node.node_code} berstatus UNSAFE`,
    triggeredValue: reading.turbidity_raw,
    triggeredAt: reading.received_at,
  });

  await relayPublisher.publishRelayOff(node.node_code);

  return {
    created: true,
    alert: toAlertDto({
      ...alert,
      node_code: node.node_code,
      location_name: node.location_name,
    }),
  };
}

async function getActiveAlerts() {
  const alerts = await alertRepository.findActiveAlerts();
  return alerts.map(toAlertDto);
}

async function getAlertHistory() {
  const alerts = await alertRepository.findAlertHistory();
  return alerts.map(toAlertDto);
}

async function updateAlertStatus({ id, status, userId }) {
  const allowedStatuses = [ALERT_STATUS.HANDLING, ALERT_STATUS.RESOLVED];

  if (!allowedStatuses.includes(status)) {
    const error = new Error('Alert status must be HANDLING or RESOLVED');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = [{ field: 'status', message: 'status must be HANDLING or RESOLVED' }];
    throw error;
  }

  const existingAlert = await alertRepository.findAlertById(id);
  if (!existingAlert) {
    const error = new Error('Alert not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    error.details = [{ field: 'id', message: 'Alert not found' }];
    throw error;
  }

  const updatedAlert = await alertRepository.updateAlertStatus({
    id,
    status,
    resolvedByUserId: status === ALERT_STATUS.RESOLVED ? userId : null,
  });

  return toAlertDto(updatedAlert);
}

module.exports = {
  mapQualityStatusToAlertLevel,
  triggerFromQualityReading,
  getActiveAlerts,
  getAlertHistory,
  updateAlertStatus,
};
