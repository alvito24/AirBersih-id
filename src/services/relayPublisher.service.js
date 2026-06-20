const mqtt = require('mqtt');
const env = require('../config/env');

async function publishRelayOff(nodeCode) {
  if (!env.relayAutoOffEnabled) {
    return { published: false, reason: 'RELAY_AUTO_OFF_DISABLED' };
  }

  if (!env.mqtt.enabled || !env.mqtt.host || !env.mqtt.username || !env.mqtt.password) {
    console.warn('Relay auto-off skipped: MQTT is disabled or credentials are incomplete');
    return { published: false, reason: 'MQTT_NOT_READY' };
  }

  const topic = `airbersih/relay/${nodeCode}/control`;
  const brokerUrl = `${env.mqtt.protocol}://${env.mqtt.host}:${env.mqtt.port}`;
  const payload = JSON.stringify({ command: 'OFF' });

  return new Promise((resolve) => {
    const relayClient = mqtt.connect(brokerUrl, {
      clientId: `${env.mqtt.clientId}-relay-${Date.now()}`,
      username: env.mqtt.username,
      password: env.mqtt.password,
      reconnectPeriod: 0,
      connectTimeout: 10000,
      clean: true,
    });

    const finish = (result) => {
      relayClient.end(true, () => resolve(result));
    };

    relayClient.on('connect', () => {
      relayClient.publish(topic, payload, { qos: 1 }, (error) => {
        if (error) {
          console.error('Relay OFF publish failed:', error.message);
          finish({ published: false, reason: 'PUBLISH_FAILED' });
          return;
        }

        console.log(`Relay OFF command published to ${topic}`);
        finish({ published: true, topic });
      });
    });

    relayClient.on('error', (error) => {
      console.error('Relay OFF MQTT error:', error.message);
      finish({ published: false, reason: 'MQTT_ERROR' });
    });
  });
}

module.exports = {
  publishRelayOff,
};
