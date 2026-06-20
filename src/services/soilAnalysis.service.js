const soilRepository = require('../repositories/soil.repository');
const bmkgAdapter = require('./bmkgAdapter.service');
const { MODEL_SOURCE, MODEL_STATUS, SOIL_STATUS } = require('../utils/constants');

function normalizeMoisturePercentage(value) {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Number(numberValue.toFixed(2))));
}

function getSoilStatus(moisturePercentage) {
  if (moisturePercentage < 35) {
    return SOIL_STATUS.LOW;
  }

  if (moisturePercentage > 70) {
    return SOIL_STATUS.HIGH;
  }

  return SOIL_STATUS.NORMAL;
}

function getAbsorptionIndex(moisturePercentage) {
  return Number((100 - normalizeMoisturePercentage(moisturePercentage)).toFixed(2));
}

function toHeatmapPoint(reading) {
  const moisturePercentage = normalizeMoisturePercentage(reading.moisture_percentage);

  return {
    node_id: reading.node_code,
    latitude: Number(reading.latitude),
    longitude: Number(reading.longitude),
    moisture_percentage: moisturePercentage,
    absorption_index: getAbsorptionIndex(moisturePercentage),
    status: getSoilStatus(moisturePercentage),
    recorded_at: reading.recorded_at,
    received_at: reading.received_at,
  };
}

function getMockHeatmapPoints() {
  const receivedAt = new Date().toISOString();
  const mockReadings = [
    {
      node_code: 'SOIL-NODE-001',
      latitude: -6.21462,
      longitude: 106.84513,
      moisture_percentage: 42,
      recorded_at: null,
      received_at: receivedAt,
    },
    {
      node_code: 'SOIL-NODE-002',
      latitude: -6.2152,
      longitude: 106.8461,
      moisture_percentage: 31,
      recorded_at: null,
      received_at: receivedAt,
    },
  ];

  return mockReadings.map(toHeatmapPoint);
}

async function getHeatmap() {
  const readings = await soilRepository.findLatestSoilReadings();
  const items = readings.length > 0 ? readings.map(toHeatmapPoint) : getMockHeatmapPoints();

  return {
    items,
    total: items.length,
    source: readings.length > 0 ? MODEL_SOURCE.DB : MODEL_SOURCE.MOCK,
    model_status: MODEL_STATUS.PENDING,
  };
}

async function getPrediction() {
  await bmkgAdapter.getWeatherContext();

  const baseDate = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + index);
    const predictedMoisture = normalizeMoisturePercentage(44 + (index % 3) * 2 - index);

    return {
      date: date.toISOString().slice(0, 10),
      predicted_moisture_percentage: predictedMoisture,
    };
  });

  return {
    days,
    source: MODEL_SOURCE.MOCK,
    model_status: MODEL_STATUS.PENDING,
    note: 'Prediction is deterministic placeholder until IS model is available.',
  };
}

module.exports = {
  normalizeMoisturePercentage,
  getSoilStatus,
  getAbsorptionIndex,
  getHeatmap,
  getPrediction,
};
