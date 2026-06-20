# AGENTS.md — AirBersih.id Backend Agent Rules

> Dokumen ini adalah aturan kerja untuk AI Coding Agent di IDE ketika mengerjakan backend AirBersih.id.  
> Agent wajib membaca dokumen ini sebelum membaca file lain atau mengubah kode.

---

## 1. Project Context

AirBersih.id adalah sistem monitoring dan manajemen air bersih berbasis web dan IoT. Backend berperan sebagai pusat API, autentikasi, penyimpanan data aplikasi, integrasi MQTT, dan penyedia data untuk frontend.

### Tech Stack Backend

- Runtime: Node.js
- Framework: Express.js
- Database: PostgreSQL
- Authentication: JWT
- Password hashing: bcrypt
- IoT realtime broker: HiveMQ Cloud via MQTT
- API style: REST API
- Optional realtime layer: WebSocket, only if explicitly requested by task
- Firebase: mirror/prototype monitoring dari tim IoT, bukan source of truth backend

### Source of Truth Backend

Urutan acuan kerja backend:

1. Blueprint final AirBersih.id v1.1
2. `arah-final.md`
3. `docs/TECHNICAL_DESIGN_BACKEND_FINAL.md`
4. Jira/timeline Software Development backend
5. Konfirmasi final tim IoT
6. Existing codebase backend

Jika ada konflik antar dokumen, ikuti urutan source of truth di atas dan jelaskan konflik tersebut sebelum coding.

---

## 2. Current Backend Status

### SYNC-59 — Done

Backend foundation sudah selesai.

Yang sudah ada:

- Express.js backend setup
- Struktur project backend
- PostgreSQL configuration
- Migration/schema awal Sprint 1
- Health check endpoint
- README awal
- `.env.example`
- GitHub push
- Jira Done

### SYNC-60 — Done

Auth dan RBAC sudah selesai.

Yang sudah ada:

- Register endpoint
- Login endpoint
- Logout endpoint
- Current user endpoint
- JWT authentication
- bcrypt password hashing
- `authenticate` middleware
- `authorizeRole` middleware
- Protected route example untuk role
- GitHub push
- Jira Done

### Rules untuk status saat ini

Agent wajib menjaga hasil SYNC-59 dan SYNC-60.

Agent tidak boleh:

- Rewrite setup backend
- Rewrite struktur project dari nol
- Rewrite auth/RBAC
- Menghapus role lama
- Menghapus migration lama
- Mengubah migration lama yang sudah berjalan
- Drop atau recreate database tanpa perintah eksplisit

Jika sebuah task membutuhkan perubahan terhadap struktur lama, buat patch minimal dan jelaskan alasan teknisnya.

---

## 3. Active MVP Scope

Blueprint final AirBersih.id v1.1 menghapus Fitur 7 Marketplace Tukang Air dan Role Admin Sistem dari MVP aktif. Backend berikutnya hanya mengerjakan fitur 1–6.

### Active Features

1. Kualitas Air
   - MQTT ingestion kualitas air
   - Read API kualitas air current/history
   - Status kualitas air berbasis enum final

2. Alert
   - Alert basic dari status kualitas air
   - Active alert
   - Alert history
   - Update status alert oleh Pengurus RT/RW

3. Tangki
   - MQTT ingestion tank status
   - Read API tank current/history
   - Raw water level handling

4. Serapan Tanah
   - Soil reading API
   - Soil heatmap basic
   - Soil prediction placeholder/basic sesuai kesiapan IS

5. Remote Pompa
   - Pump control via MQTT
   - Pump status ingestion
   - Pump operation logs

6. Billing Basic
   - Consumption ingestion/basic data
   - Billing summary basic
   - Warga billing read-only
   - Pengurus RT/RW billing aggregation basic

### Active MVP Roles

Endpoint baru hanya boleh dirancang untuk role aktif berikut:

- `WARGA`
- `PENGURUS_RT_RW`

### Legacy/Future Roles

Role berikut boleh tetap ada di database dan kode auth karena sudah dibuat pada SYNC-60, tetapi tidak dipakai untuk fitur aktif MVP:

- `ADMIN_SISTEM`
- `MITRA_TUKANG`

Agent tidak boleh menghapus role legacy/future tersebut. Cukup anggap sebagai role nonaktif untuk MVP saat ini.

---

## 4. Out of Scope

Agent tidak boleh mengerjakan fitur berikut kecuali user secara eksplisit membuka scope baru dan memperbarui blueprint:

- Marketplace Tukang Air
- Service request tukang
- Tracking mitra
- Service report
- Rating mitra
- NFC check-in
- PIR presence
- GPS tracking
- Endpoint Mitra Tukang
- Dashboard Admin Sistem baru
- Manajemen mitra
- Upload foto laporan kerja mitra
- Partner availability
- Partner assignment
- Partner location tracking
- Service request WebSocket tracking

Jika ada file lama, table lama, endpoint draft lama, atau kontrak IoT lama yang masih menyebut fitur di atas, tandai sebagai legacy/future dan jangan implementasikan.

---

## 5. Backend Task Roadmap

Backend berikutnya mengikuti task Jira/timeline berikut:

### SYNC-62 / SD-04
Water Quality MQTT Ingestion + Quality Read API

Scope utama:

- MQTT subscribe `airbersih/sensor/NODE-001/quality`
- Simpan `turbidity_raw`, `status_category`, `raw_payload`, `received_at`
- Read API current/history
- Optional REST fallback `/api/v1/sensor/reading`

### SYNC-63 / SD-05
Alert Basic

Scope utama:

- Create alert basic
- Active alert
- Alert history
- Update alert status
- Role guard untuk Pengurus RT/RW
- Jangan membuat FCM/Bull/Redis production kecuali diminta eksplisit

### SYNC-64 / SD-06
Tank Monitoring

Scope utama:

- MQTT subscribe `airbersih/tank/TANK-001/status`
- Simpan `water_level` raw ADC sebagai raw field
- Simpan `pump_status`
- Tank current/history API

### SYNC-66 / SD-07
Soil Heatmap & Prediction API

Scope utama:

- Soil reading API
- Heatmap basic
- Prediction placeholder/basic
- Integrasi model IS hanya jika output model sudah tersedia dan dikonfirmasi

### SYNC-67 / SD-08
Pump Control MQTT

Scope utama:

- Pump control endpoint
- Publish MQTT command ke `airbersih/pump/PUMP-001/control`
- Payload command wajib `{ "command": "ON" }` atau `{ "command": "OFF" }`
- Pump status ingestion/logs

### SYNC-68 / SD-09
Billing Basic

Scope utama:

- Consumption data basic
- Billing summary basic
- Billing personal Warga
- Billing aggregate Pengurus RT/RW
- PDF export hanya jika task eksplisit meminta

### SYNC-75
Deploy Backend

Scope utama:

- Deploy backend ke Railway/Render atau platform yang disepakati
- Set env production
- Smoke test endpoint production
- Share backend URL ke Frontend dan IoT

### SYNC-77
Documentation

Scope utama:

- README update
- API reference
- MQTT integration docs
- Postman/manual test guide
- Environment setup guide

### SYNC-78
Final Review

Scope utama:

- Review konsistensi implementasi vs blueprint final
- Review route/API vs UI/UX flow
- Review feature claim vs fitur yang benar-benar jalan
- Final bugfix minor
- Freeze repository

---

## 6. Role & RBAC Rules

### Role yang tetap ada di database

- `WARGA`
- `PENGURUS_RT_RW`
- `ADMIN_SISTEM`
- `MITRA_TUKANG`

### Role aktif MVP

- `WARGA`
- `PENGURUS_RT_RW`

### Role legacy/future

- `ADMIN_SISTEM`
- `MITRA_TUKANG`

### Rules endpoint baru

- Endpoint baru untuk fitur 1–6 hanya boleh menargetkan `WARGA` dan `PENGURUS_RT_RW`.
- Endpoint RT/RW-only wajib memakai `authenticate` dan `authorizeRole("PENGURUS_RT_RW")`.
- Endpoint Warga wajib read-only kecuali task secara eksplisit mengizinkan write action.
- Endpoint IoT ingestion memakai MQTT atau device/fallback mechanism, bukan JWT user.
- Jangan membuat endpoint baru untuk `MITRA_TUKANG`.
- Jangan membuat dashboard/admin endpoint baru untuk `ADMIN_SISTEM`.

### Matrix akses backend fitur 1–6

| Feature | WARGA | PENGURUS_RT_RW |
|---|---|---|
| Kualitas Air | Read current/history area sendiri | Read current/history, raw log, filter node |
| Alert | Read alert terkait area sendiri | Read active/history, update status |
| Tangki | Read status/history komunal | Read status/history semua tangki wilayah |
| Serapan Tanah | No access by default | Read heatmap/prediction |
| Remote Pompa | No control access | Control pump, read logs/status |
| Billing Basic | Read billing sendiri | Read aggregate/summary warga wilayah |

Jika scope wilayah/area belum tersedia di schema, gunakan implementasi sederhana berbasis node/tank ID dan beri TODO untuk filtering wilayah.

---

## 7. Architecture Rules

### Backend architecture

Gunakan struktur existing dari SYNC-59.

Layer yang disarankan:

- `routes/`
- `controllers/`
- `services/`
- `repositories/`
- `middlewares/`
- `config/`
- `utils/`
- `database/migrations/`
- `database/seeds/`

Jangan membuat struktur baru yang mengganti total struktur lama.

### Source of truth data

- PostgreSQL backend adalah source of truth aplikasi backend.
- Firebase hanya mirror/prototype monitoring dari tim IoT.
- MQTT adalah transport realtime, bukan database.
- REST API adalah interface utama frontend ke backend.

### WebSocket

WebSocket optional. Jangan implement WebSocket kecuali task secara eksplisit meminta atau user approve.

---

## 8. Migration Rules

Agent wajib mengikuti rules berikut:

- Jangan edit migration lama dari SYNC-59.
- Jangan mengubah file migration lama yang sudah pernah dijalankan.
- Jangan drop table lama.
- Jangan menghapus tabel lama.
- Buat migration baru untuk patch.
- Migration patch yang disarankan untuk IoT raw fields:

```text
002_add_iot_raw_fields.sql
```

### Migration patch goals

Migration baru boleh menambahkan field/tabel berikut sesuai kebutuhan task:

#### `water_quality_readings`

Tambahkan jika belum ada:

- `turbidity_raw`
- `source`
- `raw_payload`
- `received_at`

Rules:

- `turbidity_raw` adalah raw ADC.
- `turbidity_ntu` jika sudah ada harus tetap nullable.
- Jangan isi `turbidity_ntu` dengan raw ADC.
- `water_temp_celsius` harus nullable karena sensor suhu belum dikirim.
- `recorded_at` boleh null jika timestamp ESP32 null.
- `received_at` wajib diisi waktu server pada ingestion baru.

#### `tank_level_readings`

Jika belum ada, buat table. Jika sudah ada, patch field raw.

Field minimal:

- `id`
- `tank_id`
- `water_level_raw` atau field setara untuk raw ADC
- `pump_status`
- `source`
- `raw_payload`
- `recorded_at`
- `received_at`
- `created_at`

Rules:

- `water_level` dari IoT adalah raw ADC.
- Jangan menganggap `water_level` sebagai liter, persentase, atau centimeter.
- Field seperti `distance_cm`, `volume_liters`, dan `percentage` boleh ada tetapi harus nullable sampai kalibrasi siap.

#### `pump_operation_logs`

Jika belum ada, buat table untuk status/log pompa basic.

Field minimal:

- `id`
- `pump_id`
- `status`
- `source`
- `raw_payload`
- `received_at`
- `created_at`

#### Legacy tables

Jika tabel `service_requests` atau tabel marketplace lain sudah terlanjur ada, jangan dihapus. Anggap sebagai placeholder/future.

---

## 9. MQTT Rules

### Broker

Gunakan HiveMQ Cloud.

Jangan gunakan:

- EMQX public sebagai final backend config
- Topic lama `water/...`
- Topic lama `tanks/TANK-001` sebagai final contract

### Credential

- Credential wajib berasal dari `.env`.
- Jangan hardcode credential HiveMQ.
- Jangan commit `.env`.
- `.env.example` hanya boleh berisi placeholder.
- Jika credential belum tersedia, implement graceful disabled mode.

### MQTT env variables

Tambahkan atau gunakan placeholder berikut di `.env.example` dan env config jika task membutuhkan MQTT:

```env
MQTT_ENABLED=true
MQTT_HOST=your-hivemq-host
MQTT_PORT=8883
MQTT_USERNAME=your-hivemq-username
MQTT_PASSWORD=your-hivemq-password
MQTT_PROTOCOL=mqtts
MQTT_CLIENT_ID=airbersih-backend-dev
```

### MQTT disabled fallback

Jika:

```env
MQTT_ENABLED=false
```

Maka server harus tetap bisa berjalan tanpa koneksi MQTT.

Rules:

- Jangan crash server jika MQTT disabled.
- Log bahwa MQTT disabled.
- REST API tetap berjalan.
- Health check tetap berjalan.

### Final subscribe topics

Backend boleh subscribe sesuai task:

```text
airbersih/sensor/NODE-001/quality
airbersih/tank/TANK-001/status
airbersih/pump/PUMP-001/status
airbersih/relay/NODE-001/status
```

Untuk SD-04, subscribe hanya topic quality kecuali task mengizinkan topic lain.

### Final publish command topics

Backend boleh publish command sesuai task:

```text
airbersih/pump/PUMP-001/control
airbersih/relay/NODE-001/control
```

### Control payload rule

Gunakan field `command`, bukan `action`.

Valid:

```json
{ "command": "ON" }
```

```json
{ "command": "OFF" }
```

Tidak valid untuk kontrak final:

```json
{ "action": "ON" }
```

### MQTT connection strategy

Jika task mengimplementasikan MQTT client, wajib memperhatikan:

- TLS/mqtts support untuk HiveMQ Cloud
- Reconnect strategy
- Error logging yang aman
- Tidak log credential
- JSON parse error handling
- Invalid payload handling
- MQTT disabled mode
- Clean shutdown jika memungkinkan

---

## 10. Sensor Data Rules

### Air quality payload final

Backend harus siap menerima payload final berikut dari MQTT:

```json
{
  "node_id": "NODE-001",
  "turbidity_raw": 2875,
  "status_category": "TURBID",
  "timestamp": null
}
```

Rules:

- `node_id` wajib.
- `turbidity_raw` wajib number.
- `status_category` wajib salah satu:
  - `CLEAR`
  - `MILD_TURBID`
  - `TURBID`
  - `UNSAFE`
- `timestamp` boleh null.
- Backend wajib isi `received_at` dari waktu server.
- `recorded_at` boleh null jika timestamp ESP32 null.
- Simpan `raw_payload` untuk debugging.

### Turbidity rules

- `turbidity_raw` adalah ADC mentah, bukan NTU.
- Jangan mengisi `turbidity_ntu` dengan raw value.
- Jangan mengklaim raw ADC sebagai NTU.
- Jangan memakai threshold NTU lama untuk data raw.
- Kalibrasi sensor masih pending dari tim IoT.

Threshold raw sementara dari tim IoT:

```text
CLEAR        : < 2500
MILD_TURBID  : 2500 - 3000
TURBID       : 3001 - 3200
UNSAFE       : > 3200
```

Untuk sementara, `status_category` dihitung firmware. Backend cukup validasi dan simpan. Jika backend perlu menghitung ulang, harus menggunakan threshold raw di atas dan jelaskan di task report.

### Tank payload final

Backend harus siap menerima payload final berikut dari MQTT:

```json
{
  "tank_id": "TANK-001",
  "water_level": 523,
  "pump_status": "ON",
  "timestamp": null
}
```

Rules:

- `tank_id` wajib.
- `water_level` wajib number.
- `water_level` adalah ADC mentah.
- Jangan menganggap `water_level` sebagai liter, persentase, atau centimeter.
- `pump_status` enum basic: `ON` / `OFF`.
- `timestamp` boleh null.
- Backend wajib isi `received_at`.
- Simpan `raw_payload`.

Threshold raw sementara dari tim IoT:

```text
LOW  : <= 300
FULL : >= 800
```

### Pump status payload final

Backend harus siap menerima payload final berikut dari MQTT:

```json
{
  "pump_id": "PUMP-001",
  "status": "ON",
  "source": "AUTO"
}
```

Rules:

- `pump_id` wajib.
- `status` enum basic: `ON` / `OFF` / `ERROR` jika diperlukan.
- `source` enum basic: `AUTO` / `MANUAL` jika tersedia.
- Simpan `raw_payload`.
- Backend wajib isi `received_at`.

---

## 11. API Rules

### API prefix

Semua endpoint baru harus memakai prefix:

```text
/api/v1
```

### Response standard

Success response:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "...",
  "errors": {}
}
```

Gunakan helper response yang sudah ada jika tersedia.

### Validation rules

- Semua endpoint baru harus punya validasi input.
- Validasi boleh manual tanpa dependency baru jika sederhana.
- Jangan menambah dependency validasi kecuali benar-benar diperlukan dan dijelaskan.
- Jangan menerima payload bebas tanpa whitelist field.

### Auth rules

- Endpoint protected wajib memakai `authenticate`.
- Endpoint RT/RW-only wajib memakai `authorizeRole("PENGURUS_RT_RW")`.
- Warga hanya read-only untuk fitur yang memang boleh dibaca.
- Endpoint IoT ingestion via MQTT tidak memakai JWT user.
- REST fallback ingestion jika dibuat harus memakai device API key atau proteksi minimal sesuai design task. Jangan biarkan endpoint write public tanpa alasan.

### REST fallback

REST fallback boleh dibuat jika task mengizinkan, misalnya:

```text
POST /api/v1/sensor/reading
```

Rules:

- Gunakan payload yang sama dengan MQTT jika memungkinkan.
- Jangan wajibkan field yang belum dikirim firmware seperti `water_temp_celsius`.
- Jangan menjadikan REST fallback sebagai asumsi bahwa ESP32 sudah mengirim REST ke backend.

---

## 12. Dependency Rules

Agent tidak boleh menambah dependency tanpa alasan.

Exception yang diperbolehkan jika task MQTT dimulai:

- `mqtt`

Syarat menambah dependency:

1. Jelaskan kenapa dependency dibutuhkan.
2. Pastikan tidak ada dependency existing yang sudah memenuhi kebutuhan.
3. Update `package.json` dan `package-lock.json` secara normal.
4. Jelaskan perubahan dependency di summary akhir.

Jangan menambah:

- Bull
- Redis
- FCM package
- PDF package
- WebSocket package
- ORM besar
- Validation framework

kecuali task eksplisit meminta dan user approve.

---

## 13. Workflow Rules for Agent

Saat menerima task baru, agent wajib mengikuti alur ini.

### Step 1 — Read context

Baca terlebih dahulu:

1. `AGENTS.md`
2. `docs/TECHNICAL_DESIGN_BACKEND_FINAL.md`
3. Task Jira terkait jika tersedia
4. File yang relevan dengan task
5. Existing migration/schema
6. Existing routes/controllers/services/repositories

### Step 2 — Do not code immediately

Sebelum coding, agent wajib menjelaskan:

1. Pemahaman task
2. Scope yang akan dikerjakan
3. Out of scope task tersebut
4. File yang akan dibaca
5. File yang akan dibuat
6. File yang akan diubah
7. Risiko teknis
8. Rencana implementasi singkat

Jika user belum approve, jangan coding.

### Step 3 — Implement only approved scope

Saat sudah di-approve:

- Implementasikan hanya scope task itu.
- Jangan membuat fitur di luar task.
- Jangan rewrite setup.
- Jangan rewrite auth/RBAC.
- Jangan edit migration lama.
- Jangan membuat endpoint marketplace/mitra.
- Jangan menebak credential.
- Jangan hardcode secret.

### Step 4 — Post-implementation report

Setelah selesai, agent wajib menjelaskan:

1. File yang dibuat
2. File yang diubah
3. Dependency baru jika ada
4. Migration baru jika ada
5. Endpoint baru jika ada
6. MQTT topic yang dipakai jika ada
7. Env baru jika ada
8. Manual test langkah demi langkah
9. Acceptance criteria yang terpenuhi
10. Risiko/TODO
11. Contoh komentar Jira yang bisa dipaste

---

## 14. Manual Testing Rules

Setiap task backend harus menyertakan manual test.

### Minimum manual test categories

- Health check
- Auth protected endpoint test jika endpoint protected
- Role access test jika endpoint role-based
- Positive case
- Negative case
- Invalid payload case
- Empty data case
- Database persistence check jika task menyimpan data
- MQTT mock payload test jika task menggunakan MQTT

### MQTT mock test

Jika task menggunakan MQTT, test minimal harus mencakup:

- Server start saat `MQTT_ENABLED=false`
- Server start saat `MQTT_ENABLED=true` dengan env valid
- Mock publish valid JSON
- Mock publish invalid JSON
- Mock publish missing required field
- Data valid tersimpan ke database
- `received_at` terisi oleh backend
- `raw_payload` tersimpan

### Production smoke test

Untuk deploy task:

- Health check production
- Auth login production
- CORS frontend production
- Quality current endpoint production
- Environment variable check tanpa membocorkan secret

---

## 15. Jira Comment Rules

Setiap task harus menghasilkan komentar Jira siap paste.

Format minimal:

```text
Progress update — [ISSUE_KEY]

Scope:
- ...

Completed:
- ...

Testing:
- ...

Notes:
- ...

Out of scope:
- ...
```

Untuk Done update:

```text
Done update — [ISSUE_KEY]

Task completed according to scope.

Output:
- ...

Manual testing:
- PASS ...

GitHub:
[paste commit/PR link]

Notes:
- ...
```

---

## 16. Forbidden Actions

Agent dilarang melakukan hal berikut:

- Rewrite project
- Rewrite setup SYNC-59
- Rewrite auth SYNC-60
- Menghapus role lama
- Menghapus migration lama
- Mengedit migration lama yang sudah berjalan
- Menghapus tabel lama
- Drop database
- Recreate database tanpa instruksi eksplisit
- Membuat fitur marketplace
- Membuat endpoint Mitra
- Membuat service request tukang
- Membuat tracking mitra
- Membuat service report
- Membuat rating mitra
- Membuat NFC check-in
- Membuat PIR presence
- Membuat GPS tracking
- Membuat Dashboard Admin Sistem baru
- Menganggap raw sensor sebagai NTU
- Menganggap `water_level` raw sebagai liter/persentase/centimeter
- Mengisi `turbidity_ntu` dengan `turbidity_raw`
- Menggunakan topic lama `water/...` sebagai final topic
- Menggunakan EMQX public sebagai final MQTT broker
- Menggunakan field `action` untuk command final
- Hardcode credential
- Commit `.env`
- Menampilkan credential di log
- Menambah dependency tanpa alasan
- Membuat FCM/Bull/Redis production jika task hanya meminta basic alert
- Membuat WebSocket jika task tidak meminta
- Membuat PDF export jika task tidak meminta
- Membuat ML real integration jika model IS belum tersedia

---

## 17. Guardrails per Upcoming Task

### SYNC-62 / SD-04 Guardrails

Do:

- Implement MQTT quality ingestion only if approved.
- Subscribe only `airbersih/sensor/NODE-001/quality` unless task expands scope.
- Store `turbidity_raw`, `status_category`, `raw_payload`, `received_at`.
- Provide quality current/history API.

Do not:

- Implement alert automation.
- Implement tank/pump/billing.
- Treat raw as NTU.
- Require `water_temp_celsius`.

### SYNC-63 / SD-05 Guardrails

Do:

- Create basic alert logic.
- Let Pengurus RT/RW update alert status.
- Keep Warga read-only.

Do not:

- Add FCM/Bull/Redis production unless approved.
- Add marketplace notification.

### SYNC-64 / SD-06 Guardrails

Do:

- Store tank raw water level.
- Use `received_at` server time.
- Provide tank read API.

Do not:

- Convert raw ADC to liter/percentage unless calibration is provided.

### SYNC-67 / SD-08 Guardrails

Do:

- Publish MQTT command with `command` field.
- Protect pump control with `PENGURUS_RT_RW`.
- Log operation.

Do not:

- Use `action` field.
- Let Warga control pump.

### SYNC-68 / SD-09 Guardrails

Do:

- Build billing basic.
- Keep calculation transparent and simple.

Do not:

- Build PDF export unless approved.
- Build complex payment flow.

---

## 18. Final Reminder

Agent harus selalu menjaga backend tetap sederhana, modular, dan sesuai MVP final. Fokus utama adalah membuat fitur 1–6 berjalan, terintegrasi dengan IoT final, aman secara role, dan siap didemokan.

Jika menemukan konflik antara file lama dan arah final, jangan menebak. Jelaskan konflik tersebut, pilih source of truth terbaru, dan minta approval sebelum mengubah kode.
