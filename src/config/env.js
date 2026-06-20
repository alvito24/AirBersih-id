require('dotenv').config();

function getEnvString(key, fallback = undefined) {
  const value = process.env[key];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

const env = {
  nodeEnv: getEnvString('NODE_ENV', 'development'),
  port: Number(process.env.PORT) || 5000,
  databaseUrl: getEnvString('DATABASE_URL'),
  corsOrigin: getEnvString('CORS_ORIGIN', '*'),
  jwtSecret: getEnvString('JWT_SECRET'),
  jwtExpiresIn: getEnvString('JWT_EXPIRES_IN', '1d'),
  deviceApiKey: getEnvString('DEVICE_API_KEY'),
  relayAutoOffEnabled: getEnvString('RELAY_AUTO_OFF_ENABLED', 'false') === 'true',
  mqtt: {
    enabled: getEnvString('MQTT_ENABLED', 'false') === 'true',
    host: getEnvString('MQTT_HOST'),
    port: Number(process.env.MQTT_PORT) || 8883,
    username: getEnvString('MQTT_USERNAME'),
    password: getEnvString('MQTT_PASSWORD'),
    protocol: getEnvString('MQTT_PROTOCOL', 'mqtts'),
    clientId: getEnvString('MQTT_CLIENT_ID', 'airbersih-backend-dev'),
  },
};

module.exports = env;
