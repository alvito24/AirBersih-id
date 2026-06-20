const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/cors');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const protectedRoutes = require('./routes/protected.routes');
const qualityRoutes = require('./routes/quality.routes');
const alertRoutes = require('./routes/alert.routes');
const tankRoutes = require('./routes/tank.routes');
const soilRoutes = require('./routes/soil.routes');
const pumpRoutes = require('./routes/pump.routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/v1', qualityRoutes);
app.use('/api/v1', alertRoutes);
app.use('/api/v1', tankRoutes);
app.use('/api/v1', soilRoutes);
app.use('/api/v1', pumpRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
