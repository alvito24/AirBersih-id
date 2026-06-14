-- Development/testing only. Password for all demo users: password123
INSERT INTO users (role_id, name, email, password_hash, phone, address)
VALUES
  (
    (SELECT id FROM roles WHERE code = 'WARGA'),
    'Demo Warga',
    'warga@airbersih.test',
    '$2b$10$LzMqi523o0lcwKKfWWVBW.P/M5Rcrx1S5OqR3fIofpeixOEx9zVYW',
    NULL,
    NULL
  ),
  (
    (SELECT id FROM roles WHERE code = 'PENGURUS_RT_RW'),
    'Demo Pengurus RT/RW',
    'pengurus@airbersih.test',
    '$2b$10$LzMqi523o0lcwKKfWWVBW.P/M5Rcrx1S5OqR3fIofpeixOEx9zVYW',
    NULL,
    NULL
  ),
  (
    (SELECT id FROM roles WHERE code = 'ADMIN_SISTEM'),
    'Demo Admin Sistem',
    'admin@airbersih.test',
    '$2b$10$LzMqi523o0lcwKKfWWVBW.P/M5Rcrx1S5OqR3fIofpeixOEx9zVYW',
    NULL,
    NULL
  ),
  (
    (SELECT id FROM roles WHERE code = 'MITRA_TUKANG'),
    'Demo Mitra Tukang',
    'mitra@airbersih.test',
    '$2b$10$LzMqi523o0lcwKKfWWVBW.P/M5Rcrx1S5OqR3fIofpeixOEx9zVYW',
    NULL,
    NULL
  )
ON CONFLICT (email) DO UPDATE SET
  role_id = EXCLUDED.role_id,
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  is_active = TRUE,
  updated_at = NOW();
