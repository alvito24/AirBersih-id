# AirBersih.id Backend

Backend Sprint 1 untuk AirBersih.id / SYNC. Scope saat ini fokus pada SYNC-59: setup project Express.js, struktur folder, konfigurasi environment, koneksi PostgreSQL, health check, dan schema database awal.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- pg
- dotenv
- dotenv-cli
- CORS

## Install Dependencies

Jika `node_modules` belum tersedia, jalankan install dependency terlebih dahulu.

```cmd
npm install
```

## Setup Environment

Salin `.env.example` menjadi `.env`, lalu sesuaikan nilainya dengan database lokal.

```cmd
copy .env.example .env
```

Contoh isi penting:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/airbersih
CORS_ORIGIN=http://localhost:3000
```

Jangan commit file `.env`.

## Run Server

Jalankan server development dengan nodemon.

```cmd
npm run dev
```

Atau jalankan server tanpa nodemon.

```cmd
npm start
```
Server default berjalan di `http://localhost:5000`.

## Database Migration

Pastikan PostgreSQL sudah berjalan dan database sudah dibuat, misalnya `airbersih`. Script migration membaca `DATABASE_URL` dari file `.env` menggunakan `dotenv-cli`, lalu menjalankan raw SQL melalui `psql`.

```cmd
npm run db:migrate
```

Migration membuat tabel Sprint 1:

- `roles`
- `users`
- `sensor_nodes`
- `water_quality_readings`
- `alerts`
- `alert_thresholds`
- `water_tanks`
- `pumps`
- `billing_records`
- `service_requests`

## Seed Roles

Jalankan seed setelah migration berhasil. Script seed juga membaca `DATABASE_URL` dari file `.env` menggunakan `dotenv-cli`.

```cmd
npm run db:seed
```

Seed roles:

- `WARGA`
- `PENGURUS_RT_RW`
- `ADMIN_SISTEM`
- `MITRA_TUKANG`
## Health Check

Jalankan server, lalu test endpoint berikut via browser, Postman, Thunder Client, atau curl.

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

## Available Scripts

- `npm run dev` - menjalankan server development dengan nodemon.
- `npm start` - menjalankan server dengan Node.js.
- `npm run db:migrate` - menjalankan migration SQL Sprint 1.
- `npm run db:seed` - menjalankan seed default roles.
- `npm test` - placeholder untuk manual testing Sprint 1.

## Current Limitations

- Auth register, login, logout, JWT, dan RBAC belum diimplementasikan karena masuk scope SYNC-60.
- Endpoint fitur IoT, billing, marketplace, MQTT, FCM, WebSocket, dan dashboard belum diimplementasikan.
- Migration menggunakan raw SQL sederhana dan dijalankan manual melalui `psql`.
- Pastikan PostgreSQL CLI `psql` tersedia di PATH sebelum menjalankan migration atau seed.
