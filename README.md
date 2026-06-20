# Air-Bersih.id 
## Anggota Kelompok SYNC
1. Bill Stephen Jacob Sembiring_Technopreneur
2. Ladyaris Khalishah_UI/UX
3. Muhammad Fathir Rizky Salam_UIUX
4. Alvito March Vieri Nanda Sulistyo_Software Development
5. Farrel Raza Sigak Amrullah_Software Development
6. Naufal Muammar Zatnika_Technopreneur
7. Maya Radina Putri_Technopreneur
8. Erdwina Nabilah Putri_Intelligence System

# AirBersih.id Backend

Backend Sprint 1 untuk AirBersih.id / SYNC. Scope saat ini mencakup fondasi backend SYNC-59 dan auth/RBAC SYNC-60.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- pg
- dotenv
- dotenv-cli
- CORS
- bcrypt
- jsonwebtoken

## Install Dependencies

Jika `node_modules` belum tersedia, jalankan install dependency terlebih dahulu.

```cmd
npm install
```

## Setup Environment

Buat database PostgreSQL terlebih dahulu, misalnya `airbersih_sync_dev`.

Salin `.env.example` menjadi `.env`, lalu sesuaikan nilainya dengan database lokal dan JWT secret lokal.

```cmd
copy .env.example .env
```

Contoh isi penting:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

DATABASE_URL=postgresql://postgres:your_password@localhost:5432/airbersih_sync_dev
PGHOST=localhost
PGPORT=5432
PGDATABASE=airbersih_sync_dev
PGUSER=postgres
PGPASSWORD=your_password

JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=1d

MQTT_ENABLED=false
MQTT_HOST=your-hivemq-host
MQTT_PORT=8883
MQTT_USERNAME=your-hivemq-username
MQTT_PASSWORD=your-hivemq-password
MQTT_PROTOCOL=mqtts
MQTT_CLIENT_ID=airbersih-backend-dev
```

Script `psql` memakai variable standar PostgreSQL (`PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`) dari `.env`. `DATABASE_URL` tetap tersedia untuk kebutuhan aplikasi Node.js.

MQTT masih nonaktif secara default untuk development. Isi credential HiveMQ di `.env` dan ubah `MQTT_ENABLED=true` hanya saat task MQTT ingestion/control mulai diimplementasikan.

Jangan commit file `.env` dan jangan gunakan secret contoh untuk production.

## Run Server

```cmd
npm run dev
```

Atau:

```cmd
npm start
```

Server default berjalan di `http://localhost:5000`.

## Database Migration

Pastikan PostgreSQL sudah berjalan, database sudah dibuat, dan `.env` sudah berisi nilai `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, dan `PGPASSWORD` yang benar.

```cmd
npm run db:migrate
```

Jika command berhenti di `Password for user LENOVO:`, berarti `psql` tidak menerima user PostgreSQL dari environment. Periksa kembali isi `.env`.

## Seed Roles

Jalankan seed roles setelah migration berhasil.

```cmd
npm run db:seed
```

Seed roles:

- `WARGA`
- `PENGURUS_RT_RW`
- `ADMIN_SISTEM`
- `MITRA_TUKANG`
## Seed Demo Users Development

Seed demo users bersifat opsional dan hanya untuk development/testing RBAC 4 role. Password testing untuk semua demo user adalah `password123`.

```cmd
npm run db:seed:demo
```

Catatan: `npm run db:seed:demo` hanya bisa dijalankan jika file `src/database/seeds/002_seed_demo_users.sql` tersedia.

Demo users:

- `warga@airbersih.test` - role `WARGA`
- `pengurus@airbersih.test` - role `PENGURUS_RT_RW`
- `admin@airbersih.test` - role `ADMIN_SISTEM`
- `mitra@airbersih.test` - role `MITRA_TUKANG`

## Health Check

```cmd
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Backend is running",
  "data": {
    "service": "AirBersih Backend",
    "status": "OK"
  }
}
```

## Auth Endpoints

### Register

`POST /api/auth/register`

Register publik selalu membuat user dengan role default `WARGA`. Field role dari request tidak digunakan, sehingga client tidak bisa membuat Admin/Pengurus/Mitra lewat public register.

```json
{
  "name": "Budi",
  "email": "budi@example.com",
  "password": "password123",
  "phone": "08123456789",
  "address": "RT 01 RW 02"
}
```

Expected success: `201 Created`.

### Login

`POST /api/auth/login`

```json
{
  "email": "budi@example.com",
  "password": "password123"
}
```

Expected success: `200 OK`, response berisi `token` dan safe user object tanpa `password_hash`.
### Logout

`POST /api/auth/logout`

Header:

```txt
Authorization: Bearer <token>
```

Logout bersifat stateless untuk Sprint 1. Frontend bertanggung jawab menghapus token.

### Current User

`GET /api/auth/me`

Header:

```txt
Authorization: Bearer <token>
```

Expected success: `200 OK`, response berisi safe user object tanpa `password_hash`.

## Protected Route Examples

Semua endpoint berikut membutuhkan header `Authorization: Bearer <token>`.

- `GET /api/warga-only` - role `WARGA`
- `GET /api/rt-rw-only` - role `PENGURUS_RT_RW` atau `ADMIN_SISTEM`
- `GET /api/admin-only` - role `ADMIN_SISTEM`
- `GET /api/mitra-only` - role `MITRA_TUKANG`

Catatan: `ADMIN_SISTEM` boleh mengakses `/api/rt-rw-only` sebagai override role untuk kebutuhan testing/operator Sprint 1.

## Manual Testing Notes

Urutan test minimal via Postman atau Thunder Client:

1. `GET /api/health` harus mengembalikan `200 OK`.
2. `POST /api/auth/register` dengan data valid harus mengembalikan `201 Created` dan role `WARGA`.
3. Register email yang sama harus mengembalikan `409 EMAIL_ALREADY_EXISTS`.
4. `POST /api/auth/login` dengan credential valid harus mengembalikan JWT.
5. Login password salah harus mengembalikan `401 INVALID_CREDENTIALS`.
6. `GET /api/auth/me` tanpa token harus mengembalikan `401 TOKEN_MISSING`.
7. `GET /api/auth/me` dengan token valid harus mengembalikan data user tanpa `password_hash`.
8. Akses protected route dengan role benar harus mengembalikan `200 OK`.
9. Akses protected route dengan role salah harus mengembalikan `403 FORBIDDEN`.

## Available Scripts

- `npm run dev` - menjalankan server development dengan nodemon.
- `npm start` - menjalankan server dengan Node.js.
- `npm run db:migrate` - menjalankan migration SQL Sprint 1 menggunakan environment PostgreSQL dari `.env`.
- `npm run db:seed` - menjalankan seed default roles menggunakan environment PostgreSQL dari `.env`.
- `npm run db:seed:demo` - menjalankan seed demo users development/testing jika file seed demo tersedia.
- `npm test` - placeholder untuk manual testing Sprint 1.

## Database Troubleshooting

Jika muncul `Password for user LENOVO:`, penyebabnya adalah `psql` tidak menerima user `postgres` dari environment dan fallback ke user OS Windows.

Checklist:

- Pastikan `PGUSER=postgres` sudah ada di `.env`.
- Pastikan `.env` berada di root folder backend.
- Pastikan database sudah dibuat, misalnya `airbersih_sync_dev`.
- Pastikan PostgreSQL service sedang berjalan.
- Pastikan password PostgreSQL benar di `PGPASSWORD`.
- Pastikan `PGHOST`, `PGPORT`, dan `PGDATABASE` sesuai dengan PostgreSQL lokal.

## Current Limitations

- Refresh token belum diimplementasikan.
- Token blacklist belum diimplementasikan; logout stateless untuk Sprint 1.
- Endpoint fitur IoT, billing, marketplace, MQTT, FCM, WebSocket, dan dashboard belum diimplementasikan.
- Pastikan PostgreSQL CLI `psql` tersedia di PATH sebelum menjalankan migration atau seed.

## SYNC-62 Water Quality MQTT Ingestion

SYNC-62 implements Water Quality MQTT Ingestion + Quality Read API only. It does not implement alert automation, tank, pump, billing, soil, marketplace, WebSocket, or auth/RBAC changes.

### Required Migration Patch

Run the Sprint 1 migration first, then run the IoT raw field patch before testing quality ingestion.

```cmd
npm run db:migrate
```

```cmd
dotenv -e .env -- psql -v ON_ERROR_STOP=1 -f src/database/migrations/002_add_iot_raw_fields.sql
```

The patch adds `water_quality_readings.turbidity_raw`, `source`, and `raw_payload`, and makes `turbidity_ntu`/`recorded_at` nullable for raw MQTT data. Do not edit `001_create_sprint1_schema.sql`.

### Required Sensor Node

Quality ingestion maps `payload.node_id` to `sensor_nodes.node_code`. Insert `NODE-001` before MQTT or REST fallback testing if it does not exist yet.

```sql
INSERT INTO sensor_nodes (node_code, node_type, location_name)
VALUES ('NODE-001', 'WATER_QUALITY', 'Demo Node 001')
ON CONFLICT (node_code) DO NOTHING;
```

### Device API Key

REST fallback write endpoint requires `X-API-Key` matching `.env`.

```env
DEVICE_API_KEY=change_this_device_api_key
```

### MQTT Config

MQTT is disabled by default. Set these values in `.env` to connect to HiveMQ Cloud.

```env
MQTT_ENABLED=true
MQTT_HOST=your-hivemq-host
MQTT_PORT=8883
MQTT_USERNAME=your-hivemq-username
MQTT_PASSWORD=your-hivemq-password
MQTT_PROTOCOL=mqtts
MQTT_CLIENT_ID=airbersih-backend-dev
```

When `MQTT_ENABLED=false`, the server still starts and logs that MQTT is disabled.

### Quality Endpoints

- `POST /api/v1/sensor/reading` - REST fallback ingestion, requires `X-API-Key`.
- `GET /api/v1/quality/current?node_id=NODE-001` - latest reading, requires JWT role `WARGA` or `PENGURUS_RT_RW`.
- `GET /api/v1/quality/history?node_id=NODE-001&from=YYYY-MM-DD&to=YYYY-MM-DD` - history filtered by `received_at`, requires JWT role `WARGA` or `PENGURUS_RT_RW`.

### REST Fallback Test

```cmd
curl -X POST http://localhost:5000/api/v1/sensor/reading ^
  -H "Content-Type: application/json" ^
  -H "X-API-Key: change_this_device_api_key" ^
  -d "{\"node_id\":\"NODE-001\",\"turbidity_raw\":2875,\"status_category\":\"TURBID\",\"timestamp\":null}"
```

Invalid payload example:

```cmd
curl -X POST http://localhost:5000/api/v1/sensor/reading ^
  -H "Content-Type: application/json" ^
  -H "X-API-Key: change_this_device_api_key" ^
  -d "{\"node_id\":\"NODE-001\",\"status_category\":\"BAD\",\"timestamp\":null}"
```

### MQTT Mock Test

Publish to topic:

```text
airbersih/sensor/NODE-001/quality
```

Payload:

```json
{
  "node_id": "NODE-001",
  "turbidity_raw": 2875,
  "status_category": "TURBID",
  "timestamp": null
}
```

Expected result: backend stores `turbidity_raw` as raw ADC, leaves `turbidity_ntu` null, stores `raw_payload`, fills `received_at` with server time, and updates `sensor_nodes.last_ping_at`.

Invalid JSON or invalid payload should be logged and ignored without crashing the server.

### Quality Read Tests

Use a JWT from a `WARGA` or `PENGURUS_RT_RW` user.

```cmd
curl "http://localhost:5000/api/v1/quality/current?node_id=NODE-001" ^
  -H "Authorization: Bearer <token>"
```

```cmd
curl "http://localhost:5000/api/v1/quality/history?node_id=NODE-001&from=2026-01-01&to=2026-01-31" ^
  -H "Authorization: Bearer <token>"
```

Expected edge cases:

- Unknown node returns `404 NODE_NOT_FOUND`.
- Empty history returns `200 OK` with `items: []` and `total: 0`.
- Legacy roles `ADMIN_SISTEM` and `MITRA_TUKANG` are not allowed on new quality read endpoints.

## SYNC-63 Alert Basic

SYNC-63 implements Alert Basic from quality readings. It does not implement production FCM, Bull Queue, Redis, frontend notification UI, marketplace, admin dashboard, tank, pump control, billing, or soil features.

### Alert Rules

- Automatic alert creation is enabled only for `status_category = UNSAFE` in MVP basic.
- `UNSAFE` creates a `WATER_QUALITY` alert with `alert_level = CRITICAL` and `status = ACTIVE`.
- `MILD_TURBID -> WARNING` and `TURBID -> DANGER` mapping exists in service code for future use, but they do not auto-create alerts in SYNC-63.
- Duplicate prevention checks existing alerts for the same node with status `ACTIVE` or `HANDLING`.
- `triggered_value` stores `turbidity_raw` raw ADC. It is not NTU.
- Raw payload remains traceable in `water_quality_readings.raw_payload` from SYNC-62.
- Area/wilayah filtering is TODO until area schema is available; WARGA and PENGURUS_RT_RW currently read the same alert list for MVP.

### Relay Auto-Off

Relay auto-off is disabled by default.

```env
RELAY_AUTO_OFF_ENABLED=false
```

If enabled and MQTT credentials are valid, UNSAFE alert creation attempts to publish:

```text
airbersih/relay/NODE-001/control
```

```json
{ "command": "OFF" }
```

If disabled or MQTT is not ready, alert creation and quality ingestion continue without crashing.

### Alert Endpoints

All endpoints use `/api/v1`.

- `GET /api/v1/alerts/active` - JWT role `WARGA` or `PENGURUS_RT_RW`.
- `GET /api/v1/alerts/history` - JWT role `WARGA` or `PENGURUS_RT_RW`.
- `PATCH /api/v1/alerts/:id/status` - JWT role `PENGURUS_RT_RW` only.

PATCH body accepts only:

```json
{ "status": "HANDLING" }
```

```json
{ "status": "RESOLVED" }
```

`ACTIVE` is system-created only and cannot be set from the PATCH endpoint. When status is `RESOLVED`, backend sets `resolved_at = NOW()` and `resolved_by_user_id` from the JWT user.

### Alert Manual Tests

Use REST fallback from SYNC-62 with a valid `X-API-Key`.

CLEAR should not create alert:

```cmd
curl -X POST http://localhost:5000/api/v1/sensor/reading ^
  -H "Content-Type: application/json" ^
  -H "X-API-Key: <DEVICE_API_KEY>" ^
  -d "{\"node_id\":\"NODE-001\",\"turbidity_raw\":2100,\"status_category\":\"CLEAR\",\"timestamp\":null}"
```

UNSAFE should create one CRITICAL ACTIVE alert:

```cmd
curl -X POST http://localhost:5000/api/v1/sensor/reading ^
  -H "Content-Type: application/json" ^
  -H "X-API-Key: <DEVICE_API_KEY>" ^
  -d "{\"node_id\":\"NODE-001\",\"turbidity_raw\":3300,\"status_category\":\"UNSAFE\",\"timestamp\":null}"
```

Send the same UNSAFE payload again. Expected: quality reading is stored, but no duplicate alert is created while an alert for the node is `ACTIVE` or `HANDLING`.

Get active alerts as WARGA or PENGURUS_RT_RW:

```cmd
curl http://localhost:5000/api/v1/alerts/active ^
  -H "Authorization: Bearer <WARGA_OR_PENGURUS_TOKEN>"
```

Get alert history:

```cmd
curl http://localhost:5000/api/v1/alerts/history ^
  -H "Authorization: Bearer <WARGA_OR_PENGURUS_TOKEN>"
```

PATCH as WARGA should return `403 FORBIDDEN`:

```cmd
curl -X PATCH http://localhost:5000/api/v1/alerts/<ALERT_ID>/status ^
  -H "Authorization: Bearer <WARGA_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"status\":\"HANDLING\"}"
```

PATCH as PENGURUS_RT_RW should succeed:

```cmd
curl -X PATCH http://localhost:5000/api/v1/alerts/<ALERT_ID>/status ^
  -H "Authorization: Bearer <PENGURUS_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"status\":\"HANDLING\"}"
```

Resolve alert as PENGURUS_RT_RW:

```cmd
curl -X PATCH http://localhost:5000/api/v1/alerts/<ALERT_ID>/status ^
  -H "Authorization: Bearer <PENGURUS_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"status\":\"RESOLVED\"}"
```

## SYNC-64 Tank Monitoring Basic

SYNC-64 implements tank MQTT ingestion and tank read API using raw ADC values. It does not calculate real liters, percentage, distance, volume, or days remaining.

### Required Tank Seed

`TANK-001` must exist in `water_tanks` before MQTT ingestion.

```sql
INSERT INTO water_tanks (tank_code, location_name)
VALUES ('TANK-001', 'Demo Tank 001')
ON CONFLICT (tank_code) DO NOTHING;
```

Do not update `current_percentage` from `water_level_raw`; calibration is not available yet.

### MQTT Tank Topic

Backend subscribes to this topic using the existing MQTT client connection:

```text
airbersih/tank/TANK-001/status
```

Valid payload:

```json
{
  "tank_id": "TANK-001",
  "water_level": 523,
  "pump_status": "ON",
  "timestamp": null
}
```

Rules:

- `water_level` is raw ADC and is stored as `water_level_raw`.
- `pump_status` must be `ON` or `OFF`.
- `recorded_at` is null when `timestamp` is null.
- `received_at` is filled by backend server time.
- `raw_payload` is stored for debugging.
- Unknown tank code logs `TANK_NOT_FOUND` and skips ingestion; backend does not auto-create tanks.

Temporary raw status for API response only:

- `LOW` if `water_level_raw <= 300`
- `FULL` if `water_level_raw >= 800`
- `NORMAL` otherwise

This is not a percentage, liter, centimeter, distance, or volume calculation.

### Tank Endpoints

- `GET /api/v1/tanks/status` - JWT role `WARGA` or `PENGURUS_RT_RW`.
- `GET /api/v1/tanks/:tank_code/history` - JWT role `WARGA` or `PENGURUS_RT_RW`.

Response fields use raw-safe labels:

- `water_level_raw`
- `raw_status`
- `pump_status`
- `source`
- `recorded_at`
- `received_at`

### Tank Manual Tests

Start server with MQTT disabled to verify read API still works for existing data:

```env
MQTT_ENABLED=false
```

Expected: server starts and logs `MQTT disabled by environment`.

MQTT mock valid payload when `MQTT_ENABLED=true` and HiveMQ credential is valid:

```text
airbersih/tank/TANK-001/status
```

```json
{
  "tank_id": "TANK-001",
  "water_level": 523,
  "pump_status": "ON",
  "timestamp": null
}
```

MQTT mock invalid payload examples:

```json
{
  "tank_id": "TANK-001",
  "pump_status": "ON",
  "timestamp": null
}
```

```json
{
  "tank_id": "TANK-001",
  "water_level": 523,
  "pump_status": "BROKEN",
  "timestamp": null
}
```

Expected: backend logs validation error and skips ingestion without crashing.

Regression test quality MQTT still uses:

```text
airbersih/sensor/NODE-001/quality
```

```json
{
  "node_id": "NODE-001",
  "turbidity_raw": 2875,
  "status_category": "TURBID",
  "timestamp": null
}
```

Check DB persistence:

```sql
SELECT wt.tank_code, tlr.water_level_raw, tlr.pump_status, tlr.source,
       tlr.recorded_at, tlr.received_at, tlr.raw_payload
FROM tank_level_readings tlr
JOIN water_tanks wt ON wt.id = tlr.tank_id
WHERE wt.tank_code = 'TANK-001'
ORDER BY tlr.received_at DESC
LIMIT 5;
```

Get latest tank status:

```cmd
curl http://localhost:5000/api/v1/tanks/status ^
  -H "Authorization: Bearer <WARGA_OR_PENGURUS_TOKEN>"
```

Get tank history:

```cmd
curl http://localhost:5000/api/v1/tanks/TANK-001/history ^
  -H "Authorization: Bearer <WARGA_OR_PENGURUS_TOKEN>"
```

Unknown tank history should return `404 TANK_NOT_FOUND`:

```cmd
curl http://localhost:5000/api/v1/tanks/UNKNOWN/history ^
  -H "Authorization: Bearer <WARGA_OR_PENGURUS_TOKEN>"
```

## SYNC-66 Soil Heatmap and Prediction API

SYNC-66 provides protected soil heatmap and prediction responses for `PENGURUS_RT_RW` only. The Intelligence System model is not available yet, so prediction uses deterministic mock data with `source = MOCK` and `model_status = PENDING`. This is not an accuracy claim and does not load `.pkl` or `.joblib` model files.

### Required Migration

Run the soil schema migration after earlier migrations:

```cmd
dotenv -e .env -- psql -v ON_ERROR_STOP=1 -f src/database/migrations/003_create_soil_schema.sql
```

The migration only creates:

- `soil_sensor_nodes`
- `soil_moisture_readings`

It does not edit or remove older tables.

### Optional Soil Seed

Seed a soil node and reading if you want heatmap data from DB instead of mock response:

```sql
INSERT INTO soil_sensor_nodes (node_code, location_name, latitude, longitude, depth_cm)
VALUES ('SOIL-NODE-001', 'Demo Soil Node 001', -6.2146200, 106.8451300, 10)
ON CONFLICT (node_code) DO NOTHING;

INSERT INTO soil_moisture_readings (node_id, moisture_percentage, raw_payload, recorded_at)
SELECT id, 42.5, '{"source":"manual_seed"}'::jsonb, NOW()
FROM soil_sensor_nodes
WHERE node_code = 'SOIL-NODE-001';
```

`moisture_percentage` is constrained to 0-100. Soil status is:

- `LOW` if moisture is below 35
- `HIGH` if moisture is above 70
- `NORMAL` otherwise

`absorption_index = 100 - moisture_percentage` is a deterministic placeholder calculation, not an ML result.

### Soil Endpoints

Both endpoints require JWT role `PENGURUS_RT_RW`.

- `GET /api/v1/soil/heatmap`
- `GET /api/v1/soil/prediction`

WARGA, ADMIN_SISTEM, and MITRA_TUKANG should receive `403 FORBIDDEN`.

### Heatmap Test

```cmd
curl http://localhost:5000/api/v1/soil/heatmap ^
  -H "Authorization: Bearer <PENGURUS_TOKEN>"
```

Expected response shape:

```json
{
  "success": true,
  "message": "Soil heatmap retrieved",
  "data": {
    "items": [
      {
        "node_id": "SOIL-NODE-001",
        "latitude": -6.21462,
        "longitude": 106.84513,
        "moisture_percentage": 42.5,
        "absorption_index": 57.5,
        "status": "NORMAL",
        "recorded_at": "...",
        "received_at": "..."
      }
    ],
    "total": 1,
    "source": "DB",
    "model_status": "PENDING"
  }
}
```

If the DB has no soil readings, response uses deterministic mock points and returns `source = MOCK`.

### Prediction Test

```cmd
curl http://localhost:5000/api/v1/soil/prediction ^
  -H "Authorization: Bearer <PENGURUS_TOKEN>"
```

Expected response shape:

```json
{
  "success": true,
  "message": "Soil prediction retrieved",
  "data": {
    "days": [
      {
        "date": "YYYY-MM-DD",
        "predicted_moisture_percentage": 44
      }
    ],
    "source": "MOCK",
    "model_status": "PENDING",
    "note": "Prediction is deterministic placeholder until IS model is available."
  }
}
```

### WARGA Forbidden Test

```cmd
curl http://localhost:5000/api/v1/soil/heatmap ^
  -H "Authorization: Bearer <WARGA_TOKEN>"
```

Expected: `403 FORBIDDEN`.

### BMKG Placeholder

BMKG adapter is a placeholder in SYNC-66. It does not make external calls, does not require an API key, and does not add dependencies. Production BMKG integration should wait until the API contract and credential handling are clear.
