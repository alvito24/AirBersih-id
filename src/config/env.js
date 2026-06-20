require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  mqtt: {
    enabled: process.env.MQTT_ENABLED === 'true',
    host: process.env.MQTT_HOST,
    port: Number(process.env.MQTT_PORT) || 8883,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    protocol: process.env.MQTT_PROTOCOL || 'mqtts',
    clientId: process.env.MQTT_CLIENT_ID || 'airbersih-backend-dev',
  },
};

module.exports = env;
