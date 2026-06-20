BEGIN;

CREATE TABLE IF NOT EXISTS water_connections (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  connection_code VARCHAR(100) UNIQUE NOT NULL,
  location_name VARCHAR(150),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monthly_consumption_summaries (
  id BIGSERIAL PRIMARY KEY,
  connection_id BIGINT NOT NULL REFERENCES water_connections(id),
  period_month INT NOT NULL,
  period_year INT NOT NULL,
  total_usage_liters NUMERIC(12, 2) NOT NULL DEFAULT 0,
  source VARCHAR(50) DEFAULT 'SEED',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(connection_id, period_month, period_year)
);

CREATE TABLE IF NOT EXISTS tariff_config (
  id BIGSERIAL PRIMARY KEY,
  tariff_name VARCHAR(100) NOT NULL,
  rate_per_m3 NUMERIC(12, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE billing_records
  ADD COLUMN IF NOT EXISTS connection_id BIGINT NULL REFERENCES water_connections(id),
  ADD COLUMN IF NOT EXISTS summary_id BIGINT NULL REFERENCES monthly_consumption_summaries(id),
  ADD COLUMN IF NOT EXISTS rate_per_m3 NUMERIC(12, 2) NULL,
  ADD COLUMN IF NOT EXISTS total_m3 NUMERIC(12, 3) NULL;

CREATE UNIQUE INDEX IF NOT EXISTS billing_records_connection_period_unique
  ON billing_records (connection_id, period_month, period_year)
  WHERE connection_id IS NOT NULL;

COMMIT;
