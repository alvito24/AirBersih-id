# AirBersih.id Backend

Backend AirBersih.id adalah REST API MVP untuk monitoring air bersih lingkungan berbasis Express.js, PostgreSQL, JWT, dan MQTT HiveMQ Cloud. PostgreSQL menjadi source of truth backend. MQTT dipakai sebagai transport data perangkat IoT, sedangkan Firebase hanya mirror/prototype dari sisi IoT dan bukan sumber data utama backend.

## Status MVP

Dokumentasi ini mencerminkan implementasi final backend SYNC-59 sampai SYNC-68.

- Status: MVP backend aktif.
- Session utama frontend: REST API.
- Transport IoT: MQTT HiveMQ Cloud dan REST fallback untuk quality ingestion.
- Role aktif MVP: `WARGA`, `PENGURUS_RT_RW`.
- Role legacy/future: `ADMIN_SISTEM`, `MITRA_TUKANG`.
- Marketplace Tukang Air sudah dihapus dari MVP dan tidak didokumentasikan sebagai fitur aktif.

## Tech Stack

- Node.js + Express.js 5
- PostgreSQL
- JWT authentication
- bcrypt password hashing
- MQTT.js untuk HiveMQ Cloud
- dotenv + dotenv-cli
- Nodemon untuk development

## Struktur Folder Penting

```text
backend/
  src/
    app.js                 # Express app dan route mounting
    server.js              # Server bootstrap dan MQTT startup
    config/                # env, cors, db
    controllers/           # HTTP handlers
    services/              # business logic
    repositories/          # query PostgreSQL
    routes/                # route definitions
    middlewares/           # auth, role guard, error handler
    utils/                 # response, constants, validation
    database/
      migrations/          # SQL schema dan patch migration
      seeds/               # seed role, user demo, billing demo
  docs/                    # dokumentasi teknis/API/MQTT/testing
  .env.example             # placeholder env lokal
  package.json             # scripts dan dependency
```

## Role dan Akses

- `WARGA`: role aktif MVP untuk warga; dapat login, membaca kualitas air, alert, status tangki, dan billing pribadi.
- `PENGURUS_RT_RW`: role aktif MVP untuk pengurus; dapat membaca monitoring, mengubah status alert, soil API, pump control/status/logs, billing summary, dan export placeholder.
- `ADMIN_SISTEM`: role legacy/future; masih ada di seed dan protected route contoh, tetapi bukan role aktif fitur MVP final.
- `MITRA_TUKANG`: role legacy/future; masih ada di seed dan protected route contoh, tetapi Marketplace Tukang Air tidak aktif di MVP.

## Fitur Backend Aktif

- Auth & RBAC: register, login, logout stateless, current user, role guard.
- Water quality monitoring: MQTT ingestion, REST fallback, current/history API.
- Basic alert: alert `CRITICAL` `ACTIVE` saat quality `UNSAFE`, duplicate prevention, active/history API, update status oleh pengurus.
- Tank monitoring: MQTT ingestion, status/history API berbasis raw ADC.
- Soil heatmap & prediction placeholder: heatmap DB/fallback mock, prediction deterministic mock.
- Remote pump control: REST command ke MQTT publish, status ingestion MQTT, status/logs API.
- Billing basic: billing pribadi warga, summary pengurus, export PDF placeholder JSON.

## Out of Scope / Tidak Aktif MVP

- Marketplace Tukang Air.
- Service request tukang.
- Tracking mitra.
- Service report.
- Rating mitra.
- NFC check-in.
- PIR presence.
- GPS tracking.
- Admin dashboard baru.
- Payment gateway.
- Real PDF generation.
- FCM/Bull/Redis production.
- ML model production.
- BMKG production integration.
- WebSocket realtime.

## Install

```cmd
npm install
```

## Setup Environment

Salin `.env.example` menjadi `.env`, lalu sesuaikan nilainya untuk lokal.

```cmd
copy .env.example .env
```

Variable utama:

```env
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000

DATABASE_URL=postgresql://postgres:your_password@localhost:5432/airbersih_sync_dev
PGHOST=localhost
PGPORT=5432
PGDATABASE=airbersih_sync_dev
PGUSER=postgres
PGPASSWORD=your_password

JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=1d
DEVICE_API_KEY=change_this_device_api_key

MQTT_ENABLED=false
MQTT_HOST=your-hivemq-host
MQTT_PORT=8883
MQTT_USERNAME=your-hivemq-username
MQTT_PASSWORD=your-hivemq-password
MQTT_PROTOCOL=mqtts
MQTT_CLIENT_ID=airbersih-backend-dev
RELAY_AUTO_OFF_ENABLED=false
```

Catatan:

- `DATABASE_URL` dipakai aplikasi Node.js.
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` dipakai script `psql` via `dotenv-cli`.
- `DEVICE_API_KEY` wajib untuk endpoint REST fallback device `POST /api/v1/sensor/reading`.
- `MQTT_ENABLED=false` membuat REST API tetap berjalan tanpa koneksi MQTT.
- `RELAY_AUTO_OFF_ENABLED` masih optional; jika aktif, alert UNSAFE mencoba publish relay OFF.

## Keamanan .env

- Jangan commit `.env`.
- `.env.example` hanya placeholder dan tidak boleh berisi secret asli.
- Credential HiveMQ Cloud wajib dibagikan lewat private channel.
- Gunakan `JWT_SECRET` kuat untuk production.

## Menjalankan Lokal

Development dengan nodemon:

```cmd
npm run dev
```

Production-like local start:

```cmd
npm start
```

Health check:

```cmd
curl http://localhost:5000/api/health
```

## Migration

Script `db:migrate` saat ini hanya menjalankan migration awal `001_create_sprint1_schema.sql`:

```cmd
npm run db:migrate
```
Jalankan patch migration lanjutan secara manual dengan urutan berikut jika belum dimasukkan ke script migrate:

```cmd
dotenv -e .env -- psql -v ON_ERROR_STOP=1 -f src/database/migrations/002_add_iot_raw_fields.sql
dotenv -e .env -- psql -v ON_ERROR_STOP=1 -f src/database/migrations/003_create_soil_schema.sql
dotenv -e .env -- psql -v ON_ERROR_STOP=1 -f src/database/migrations/004_patch_pump_operation_logs_audit_fields.sql
dotenv -e .env -- psql -v ON_ERROR_STOP=1 -f src/database/migrations/005_create_billing_schema.sql
```

Ringkasan migration:

- `001_create_sprint1_schema.sql`: role, users, sensor nodes, quality readings, alerts, tanks, pumps, billing awal, dan tabel legacy/future.
- `002_add_iot_raw_fields.sql`: patch raw IoT untuk quality/tank/pump logs; `turbidity_raw` dan `water_level_raw` adalah ADC mentah.
- `003_create_soil_schema.sql`: tabel soil sensor node dan soil moisture readings.
- `004_patch_pump_operation_logs_audit_fields.sql`: audit field untuk log command pump.
- `005_create_billing_schema.sql`: water connections, monthly consumption summaries, tariff config, dan patch billing records.

Jangan mengubah migration lama yang sudah pernah berjalan. Jika perlu patch baru, buat migration baru.

## Seed

Seed roles:

```cmd
npm run db:seed
```

Seed demo users:

```cmd
npm run db:seed:demo
```

Akun demo dari seed:

- `warga@airbersih.test` / `password123` - `WARGA`
- `pengurus@airbersih.test` / `password123` - `PENGURUS_RT_RW`
- `admin@airbersih.test` / `password123` - `ADMIN_SISTEM` legacy/future
- `mitra@airbersih.test` / `password123` - `MITRA_TUKANG` legacy/future

Seed billing demo:

```cmd
npm run db:seed:billing
```

Seed manual yang diperlukan untuk IoT demo jika belum ada:

```sql
INSERT INTO sensor_nodes (node_code, node_type, location_name)
VALUES ('NODE-001', 'WATER_QUALITY', 'Demo Node 001')
ON CONFLICT (node_code) DO NOTHING;

INSERT INTO water_tanks (tank_code, location_name)
VALUES ('TANK-001', 'Demo Tank 001')
ON CONFLICT (tank_code) DO NOTHING;

INSERT INTO pumps (pump_code, tank_id, node_id, current_status, created_at)
SELECT 'PUMP-001', wt.id, sn.id, 'OFF', NOW()
FROM water_tanks wt
JOIN sensor_nodes sn ON sn.node_code = 'NODE-001'
WHERE wt.tank_code = 'TANK-001'
  AND NOT EXISTS (SELECT 1 FROM pumps WHERE pump_code = 'PUMP-001');

INSERT INTO soil_sensor_nodes (node_code, location_name, latitude, longitude, depth_cm)
VALUES ('SOIL-NODE-001', 'Demo Soil Node 001', -6.21462, 106.84513, 20)
ON CONFLICT (node_code) DO NOTHING;
```

`SOIL-NODE-001` optional karena heatmap memiliki fallback mock saat database kosong.

## Endpoint Utama

Base local: `http://localhost:5000`

Legacy/auth prefix:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/warga-only`
- `GET /api/rt-rw-only`
- `GET /api/admin-only`
- `GET /api/mitra-only`

MVP API v1:

- `POST /api/v1/sensor/reading`
- `GET /api/v1/quality/current`
- `GET /api/v1/quality/history`
- `GET /api/v1/alerts/active`
- `GET /api/v1/alerts/history`
- `PATCH /api/v1/alerts/:id/status`
- `GET /api/v1/tanks/status`
- `GET /api/v1/tanks/:tank_code/history`
- `GET /api/v1/soil/heatmap`
- `GET /api/v1/soil/prediction`
- `POST /api/v1/pumps/:pump_code/control`
- `GET /api/v1/pumps/:pump_code/status`
- `GET /api/v1/pumps/:pump_code/logs`
- `GET /api/v1/billing/my`
- `GET /api/v1/billing/summary`
- `GET /api/v1/billing/:id/export-pdf`

Detail request/response ada di `docs/API_DOCUMENTATION.md`.

## Manual Test Per Fitur

1. Auth: health check, register warga, login demo warga/pengurus, `GET /api/auth/me`, cek 401 tanpa token dan 403 role salah.
2. Quality: seed `NODE-001`, kirim `POST /api/v1/sensor/reading` dengan `X-API-Key`, baca current/history sebagai warga/pengurus.
3. Alerts: kirim quality `UNSAFE`, cek `GET /api/v1/alerts/active`, update status `HANDLING`/`RESOLVED` sebagai pengurus.
4. Tanks: seed `TANK-001`, publish MQTT tank status, cek `GET /api/v1/tanks/status` dan history.
5. Soil: login pengurus, cek heatmap dan prediction; pastikan warga mendapat 403.
6. Pumps: seed `PUMP-001`, login pengurus, coba control `ON/OFF`; jika MQTT nonaktif harus menerima `MQTT_NOT_READY` tanpa server crash.
7. Billing: jalankan seed billing, login warga untuk `billing/my`, login pengurus untuk `billing/summary` dan `export-pdf` placeholder.

Checklist detail ada di `docs/POSTMAN_TESTING_CHECKLIST.md`.

## MQTT

Broker yang digunakan adalah HiveMQ Cloud via MQTT over TLS (`mqtts`) port `8883`. Topic aktif:

- `airbersih/sensor/NODE-001/quality`
- `airbersih/tank/TANK-001/status`
- `airbersih/pump/PUMP-001/status`
- `airbersih/pump/PUMP-001/control`

Topic relay berikut bersifat reserved/future/optional dan hanya dipakai jika konfigurasi relay auto-off diaktifkan:

- `airbersih/relay/NODE-001/status`
- `airbersih/relay/NODE-001/control`

Detail kontrak ada di `docs/MQTT_CONTRACT.md`.

## Deploy Singkat

Platform contoh: Railway atau Render.

1. Buat PostgreSQL production dan jalankan migration/seed yang diperlukan.
2. Set env production: `NODE_ENV`, `PORT`, `CORS_ORIGIN`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `DEVICE_API_KEY`, dan seluruh env MQTT jika MQTT production aktif.
3. Gunakan credential HiveMQ production dari private channel.
4. Deploy dengan start command `npm start`.
5. Smoke test `GET /api/health`, login demo/non-demo production, dan endpoint v1 yang dibutuhkan frontend/IoT.

## Known Limitations

- `turbidity_raw` masih raw ADC dan belum dikalibrasi menjadi NTU.
- `water_level_raw` masih raw ADC dan belum dikalibrasi menjadi liter, persentase, atau centimeter.
- Soil prediction masih deterministic mock; `model_status=PENDING`.
- BMKG adapter placeholder dan tidak melakukan production external call.
- Firebase hanya mirror/prototype dari IoT, bukan source of truth backend.
- Export PDF masih placeholder JSON; belum ada dependency PDF production.
- Payment gateway belum ada.
- FCM/Bull/Redis tidak dipakai production.
- Marketplace Tukang Air dihapus dari MVP.
- `ADMIN_SISTEM` dan `MITRA_TUKANG` masih legacy/future role.
- Filtering area/RT/RW belum detail karena schema wilayah belum tersedia.
- WebSocket belum diimplementasikan.

Daftar lengkap ada di `docs/KNOWN_LIMITATIONS.md`.

## Notes untuk Frontend

- Gunakan `Authorization: Bearer <token>` untuk endpoint yang membutuhkan JWT.
- Auth masih memakai prefix legacy `/api/auth`, bukan `/api/v1/auth`.
- Endpoint fitur MVP memakai prefix `/api/v1`.
- Gunakan role aktif MVP saja untuk fitur final: `WARGA` dan `PENGURUS_RT_RW`.
- Jangan tampilkan Marketplace Tukang Air sebagai fitur aktif MVP.
- Untuk pump control, body wajib `{ "command": "ON" }` atau `{ "command": "OFF" }`; jangan gunakan `action`.

## Notes untuk IoT

- PostgreSQL backend adalah source of truth; MQTT hanya transport.
- `timestamp` dari ESP32 boleh `null`; backend mengisi `received_at` dengan waktu server.
- Quality memakai `turbidity_raw`, bukan `turbidity_ntu`.
- Tank memakai `water_level` payload yang disimpan sebagai `water_level_raw`.
- Invalid JSON di MQTT diabaikan dan tidak boleh membuat server crash.
- Jika MQTT belum siap, backend REST tetap berjalan.

## Suggested Commit Grouping

Saran commit untuk SYNC-77, tanpa menjalankan rebase/reset otomatis:

1. `docs: update backend README for MVP final scope`
2. `docs: add REST API documentation`
3. `docs: add MQTT contract and testing checklist`
4. `docs: document known backend limitations`
