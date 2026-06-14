INSERT INTO roles (code, name, description)
VALUES
  ('WARGA', 'Warga', 'Pengguna akhir AirBersih.id'),
  ('PENGURUS_RT_RW', 'Pengurus RT/RW', 'Pengurus wilayah untuk operasional lingkungan'),
  ('ADMIN_SISTEM', 'Admin Sistem', 'Administrator sistem AirBersih.id'),
  ('MITRA_TUKANG', 'Mitra Tukang', 'Mitra lapangan untuk layanan perbaikan')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
