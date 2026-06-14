const env = require('./env');

const corsOptions = {
  origin: env.corsOrigin === '*' ? true : env.corsOrigin,
  credentials: true,
};

module.exports = corsOptions;
