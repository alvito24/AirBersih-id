BEGIN;

CREATE TABLE IF NOT EXISTS soil_sensor_nodes (
  id BIGSERIAL PRIMARY KEY,
  node_code VARCHAR(100) NOT NULL UNIQUE,
  location_name VARCHAR(150),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  depth_cm DECIMAL(10, 2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS soil_moisture_readings (
  id BIGSERIAL PRIMARY KEY,
  node_id BIGINT NOT NULL REFERENCES soil_sensor_nodes(id),
  moisture_percentage DECIMAL(5, 2) NOT NULL CHECK (moisture_percentage >= 0 AND moisture_percentage <= 100),
  raw_payload JSONB,
  recorded_at TIMESTAMP,
  received_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_soil_sensor_nodes_node_code
  ON soil_sensor_nodes(node_code);

CREATE INDEX IF NOT EXISTS idx_soil_moisture_readings_node_received_at
  ON soil_moisture_readings(node_id, received_at DESC);

COMMIT;
