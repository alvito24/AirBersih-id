const mqtt = require('mqtt');
const env = require('../config/env');
const qualityService = require('./quality.service');
const tankService = require('./tank.service');
const pumpService = require('./pump.service');
const { READING_SOURCE } = require('../utils/constants');

const QUALITY_TOPIC = 'airbersih/sensor/NODE-001/quality';
const TANK_TOPIC = 'airbersih/tank/TANK-001/status';
const PUMP_STATUS_TOPIC = 'airbersih/pump/PUMP-001/status';
let client = null;

function hasMqttCredentials() {
  return Boolean(env.mqtt.host && env.mqtt.username && env.mqtt.password);
}

function startMqttService() {
  if (!env.mqtt.enabled) {
    console.log('MQTT disabled by environment');
    return null;
  }

  if (!hasMqttCredentials()) {
    console.warn('MQTT enabled but host/username/password is incomplete. MQTT service will not start.');
    return null;
  }

  const brokerUrl = `${env.mqtt.protocol}://${env.mqtt.host}:${env.mqtt.port}`;
  client = mqtt.connect(brokerUrl, {
    clientId: env.mqtt.clientId,
    username: env.mqtt.username,
    password: env.mqtt.password,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
    clean: true,
  });

  client.on('connect', () => {
    console.log('MQTT connected to HiveMQ Cloud');
    client.subscribe([QUALITY_TOPIC, TANK_TOPIC, PUMP_STATUS_TOPIC], { qos: 1 }, (error) => {
      if (error) {
        console.error('MQTT subscribe failed:', error.message);
        return;
      }

      console.log(`MQTT subscribed to ${QUALITY_TOPIC}`);
      console.log(`MQTT subscribed to ${TANK_TOPIC}`);
      console.log(`MQTT subscribed to ${PUMP_STATUS_TOPIC}`);
    });
  });

  client.on('reconnect', () => {
    console.log('MQTT reconnecting...');
  });

  client.on('close', () => {
    console.warn('MQTT connection closed');
  });

  client.on('error', (error) => {
    console.error('MQTT error:', error.message);
  });

  client.on('message', async (topic, messageBuffer) => {
    if (topic === QUALITY_TOPIC) {
      await handleQualityMessage(messageBuffer);
      return;
    }

    if (topic === TANK_TOPIC) {
      await handleTankMessage(messageBuffer);
      return;
    }

    if (topic === PUMP_STATUS_TOPIC) {
      await handlePumpStatusMessage(messageBuffer);
    }
  });

  return client;
}

async function handleQualityMessage(messageBuffer) {
  let payload;

  try {
    payload = JSON.parse(messageBuffer.toString('utf8'));
  } catch (error) {
    console.error('MQTT quality payload invalid JSON:', error.message);
    return;
  }

  try {
    await qualityService.ingestQualityReading(payload, READING_SOURCE.MQTT);
    console.log(`MQTT quality reading stored for node ${payload.node_id}`);
  } catch (error) {
    const code = error.code || 'MQTT_INGESTION_ERROR';
    console.error(`MQTT quality ingestion failed: ${code} - ${error.message}`);
  }
}

async function handleTankMessage(messageBuffer) {
  let payload;

  try {
    payload = JSON.parse(messageBuffer.toString('utf8'));
  } catch (error) {
    console.error('MQTT tank payload invalid JSON:', error.message);
    return;
  }

  try {
    await tankService.ingestTankReading(payload, READING_SOURCE.MQTT);
    console.log(`MQTT tank reading stored for tank ${payload.tank_id}`);
  } catch (error) {
    const code = error.code || 'MQTT_TANK_INGESTION_ERROR';
    console.error(`MQTT tank ingestion failed: ${code} - ${error.message}`);
  }
}

async function handlePumpStatusMessage(messageBuffer) {
  let payload;

  try {
    payload = JSON.parse(messageBuffer.toString('utf8'));
  } catch (error) {
    console.error('MQTT pump status payload invalid JSON:', error.message);
    return;
  }

  try {
    await pumpService.ingestPumpStatus(payload);
    console.log(`MQTT pump status stored for pump ${payload.pump_id}`);
  } catch (error) {
    const code = error.code || 'MQTT_PUMP_STATUS_INGESTION_ERROR';
    console.error(`MQTT pump status ingestion failed: ${code} - ${error.message}`);
  }
}

function buildPumpControlTopic(pumpCode) {
  return `airbersih/pump/${pumpCode}/control`;
}

function publishPumpCommand(pumpCode, command) {
  if (!env.mqtt.enabled || !client || !client.connected) {
    const error = new Error('MQTT client is not ready');
    error.statusCode = 503;
    error.code = 'MQTT_NOT_READY';
    error.details = [{ field: 'mqtt', message: 'MQTT is disabled or not connected' }];
    throw error;
  }

  const topic = buildPumpControlTopic(pumpCode);
  const payload = JSON.stringify({ command });

  return new Promise((resolve, reject) => {
    client.publish(topic, payload, { qos: 1 }, (error) => {
      if (error) {
        error.statusCode = 503;
        error.code = 'MQTT_NOT_READY';
        reject(error);
        return;
      }

      resolve({ topic, payload: { command } });
    });
  });
}

function stopMqttService() {
  if (!client) {
    return;
  }

  client.end(false, () => {
    console.log('MQTT connection closed gracefully');
  });
}

module.exports = {
  QUALITY_TOPIC,
  TANK_TOPIC,
  PUMP_STATUS_TOPIC,
  buildPumpControlTopic,
  publishPumpCommand,
  startMqttService,
  stopMqttService,
};
