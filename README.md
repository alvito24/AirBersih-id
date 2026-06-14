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
```

Script `psql` memakai variable standar PostgreSQL (`PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`) dari `.env`. `DATABASE_URL` tetap tersedia untuk kebutuhan aplikasi Node.js.

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
