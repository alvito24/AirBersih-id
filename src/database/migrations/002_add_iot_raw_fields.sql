BEGIN;

-- Patch for final IoT MQTT contract. Do not edit SYNC-59 migration history.
ALTER TABLE water_quality_readings
  ALTER COLUMN turbidity_ntu DROP NOT NULL,
  ALTER COLUMN recorded_at DROP NOT NULL;

ALTER TABLE water_quality_readings
  ADD COLUMN IF NOT EXISTS turbidity_raw INTEGER,
  ADD COLUMN IF NOT EXISTS source VARCHAR(50),
  ADD COLUMN IF NOT EXISTS raw_payload JSONB;

CREATE TABLE IF NOT EXISTS tank_level_readings (
  id BIGSERIAL PRIMARY KEY,
  tank_id BIGINT REFERENCES water_tanks(id),
  water_level_raw INTEGER NOT NULL,
  pump_status VARCHAR(50),
  source VARCHAR(50),
  raw_payload JSONB,
  recorded_at TIMESTAMP,
  received_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pump_operation_logs (
  id BIGSERIAL PRIMARY KEY,
  pump_id BIGINT REFERENCES pumps(id),
  command VARCHAR(50),
  status VARCHAR(50),
  source VARCHAR(50),
  raw_payload JSONB,
  received_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE service_requests IS 'Legacy/future placeholder from Sprint 1. Marketplace Tukang Air is out of active MVP scope.';
COMMENT ON COLUMN water_quality_readings.turbidity_raw IS 'Raw ADC turbidity value from IoT payload; do not treat as NTU.';
COMMENT ON COLUMN tank_level_readings.water_level_raw IS 'Raw ADC tank level value from IoT payload; do not treat as liter, percentage, or centimeter.';

COMMIT;
