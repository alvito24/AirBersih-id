BEGIN;

CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  role_id BIGINT NOT NULL REFERENCES roles(id),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_nodes (
  id BIGSERIAL PRIMARY KEY,
  node_code VARCHAR(100) NOT NULL UNIQUE,
  node_type VARCHAR(50) NOT NULL,
  location_name VARCHAR(150),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_ping_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS water_quality_readings (
  id BIGSERIAL PRIMARY KEY,
  node_id BIGINT NOT NULL REFERENCES sensor_nodes(id),
  turbidity_ntu DECIMAL(10, 2) NOT NULL,
  water_temp_celsius DECIMAL(5, 2),
  status_category VARCHAR(50) NOT NULL,
  recorded_at TIMESTAMP NOT NULL,
  received_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  node_id BIGINT REFERENCES sensor_nodes(id),
  alert_type VARCHAR(50) NOT NULL,
  alert_level VARCHAR(50) NOT NULL,
  message TEXT,
  triggered_value DECIMAL(10, 2),
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  triggered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolved_by_user_id BIGINT REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS alert_thresholds (
  id BIGSERIAL PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  level VARCHAR(50) NOT NULL,
  min_value DECIMAL(10, 2) NOT NULL,
  max_value DECIMAL(10, 2),
  auto_action VARCHAR(50) NOT NULL DEFAULT 'NONE',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS water_tanks (
  id BIGSERIAL PRIMARY KEY,
  tank_code VARCHAR(100) NOT NULL UNIQUE,
  location_name VARCHAR(150),
  capacity_liters DECIMAL(12, 2),
  tank_height_cm DECIMAL(10, 2),
  current_percentage DECIMAL(5, 2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pumps (
  id BIGSERIAL PRIMARY KEY,
  pump_code VARCHAR(100) NOT NULL UNIQUE,
  tank_id BIGINT REFERENCES water_tanks(id),
  node_id BIGINT REFERENCES sensor_nodes(id),
  current_status VARCHAR(50) NOT NULL DEFAULT 'OFFLINE',
  last_command_at TIMESTAMP,
  last_confirmed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing_records (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  period_month INT NOT NULL,
  period_year INT NOT NULL,
  total_usage_liters DECIMAL(12, 2),
  total_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
  issued_at TIMESTAMP NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_requests (
  id BIGSERIAL PRIMARY KEY,
  requester_user_id BIGINT NOT NULL REFERENCES users(id),
  assigned_partner_user_id BIGINT REFERENCES users(id),
  service_type VARCHAR(100) NOT NULL,
  description TEXT,
  urgency_level VARCHAR(50) NOT NULL DEFAULT 'LOW',
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  assigned_at TIMESTAMP,
  completed_at TIMESTAMP
);

COMMIT;
