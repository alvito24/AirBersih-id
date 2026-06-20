const mqtt = require('mqtt');
const env = require('../config/env');
const qualityService = require('./quality.service');
const tankService = require('./tank.service');
const { READING_SOURCE } = require('../utils/constants');

const QUALITY_TOPIC = 'airbersih/sensor/NODE-001/quality';
const TANK_TOPIC = 'airbersih/tank/TANK-001/status';
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
    client.subscribe([QUALITY_TOPIC, TANK_TOPIC], { qos: 1 }, (error) => {
      if (error) {
        console.error('MQTT subscribe failed:', error.message);
        return;
      }

      console.log(`MQTT subscribed to ${QUALITY_TOPIC}`);
      console.log(`MQTT subscribed to ${TANK_TOPIC}`);
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
  startMqttService,
  stopMqttService,
};
