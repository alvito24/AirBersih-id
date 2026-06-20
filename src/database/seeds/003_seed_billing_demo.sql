BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'warga@airbersih.test') THEN
    RAISE EXCEPTION 'Demo WARGA user warga@airbersih.test not found. Run npm run db:seed:demo before npm run db:seed:billing.';
  END IF;
END $$;

INSERT INTO tariff_config (tariff_name, rate_per_m3, is_active, created_at)
SELECT 'Demo Basic Tariff', 5000, TRUE, NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM tariff_config
  WHERE tariff_name = 'Demo Basic Tariff'
);

INSERT INTO water_connections (user_id, connection_code, location_name, is_active, created_at)
SELECT u.id, 'CONN-DEMO-001', 'Demo Warga Connection', TRUE, NOW()
FROM users u
WHERE u.email = 'warga@airbersih.test'
ON CONFLICT (connection_code) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  location_name = EXCLUDED.location_name,
  is_active = TRUE;

INSERT INTO monthly_consumption_summaries (
  connection_id,
  period_month,
  period_year,
  total_usage_liters,
  source,
  created_at
)
SELECT wc.id, 6, 2026, 12500, 'SEED', NOW()
FROM water_connections wc
WHERE wc.connection_code = 'CONN-DEMO-001'
ON CONFLICT (connection_id, period_month, period_year) DO UPDATE SET
  total_usage_liters = EXCLUDED.total_usage_liters,
  source = EXCLUDED.source;

INSERT INTO billing_records (
  user_id,
  period_month,
  period_year,
  total_usage_liters,
  total_amount,
  status,
  issued_at,
  connection_id,
  summary_id,
  rate_per_m3,
  total_m3
)
SELECT
  wc.user_id,
  mcs.period_month,
  mcs.period_year,
  mcs.total_usage_liters,
  ROUND(((mcs.total_usage_liters / 1000.0) * tc.rate_per_m3)::numeric, 0),
  'UNPAID',
  NOW(),
  wc.id,
  mcs.id,
  tc.rate_per_m3,
  ROUND((mcs.total_usage_liters / 1000.0)::numeric, 3)
FROM water_connections wc
JOIN monthly_consumption_summaries mcs
  ON mcs.connection_id = wc.id
JOIN LATERAL (
  SELECT id, rate_per_m3
  FROM tariff_config
  WHERE is_active = TRUE
  ORDER BY created_at DESC, id DESC
  LIMIT 1
) tc ON TRUE
WHERE wc.connection_code = 'CONN-DEMO-001'
  AND mcs.period_month = 6
  AND mcs.period_year = 2026
ON CONFLICT (connection_id, period_month, period_year) WHERE connection_id IS NOT NULL
DO UPDATE SET
  user_id = EXCLUDED.user_id,
  total_usage_liters = EXCLUDED.total_usage_liters,
  total_amount = EXCLUDED.total_amount,
  status = EXCLUDED.status,
  summary_id = EXCLUDED.summary_id,
  rate_per_m3 = EXCLUDED.rate_per_m3,
  total_m3 = EXCLUDED.total_m3;

COMMIT;
