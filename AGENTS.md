# AGENTS.md — Backend Sprint 1 AirBersih.id / SYNC

## 1. Project Context

AirBersih.id / SYNC adalah project final multi-divisi yang melibatkan TechnoPreneur/PM, UI/UX, IoT, dan Software Development. File ini dibuat khusus untuk AI coding agent di IDE agar agent membantu pengerjaan backend Sprint 1 secara terarah, realistis, dan tidak melebar dari scope.

User adalah backend developer. Tugas backend Sprint 1 hanya fokus pada:

1. `SYNC-59` — Setup proyek, arsitektur, dan database schema.
2. `SYNC-60` — Auth JWT dan RBAC 4 role.

Tech stack backend:

- Node.js
- Express.js
- PostgreSQL
- JWT
- bcrypt
- dotenv
- CORS

Role sistem:

- `WARGA`
- `PENGURUS_RT_RW`
- `ADMIN_SISTEM`
- `MITRA_TUKANG`

Backend Sprint 1 harus mudah dipahami oleh mahasiswa/developer tim, maintainable, dan tidak over-engineered.

---

## 2. Sprint 1 Scope

Sprint 1 hanya mencakup fondasi backend dan auth/RBAC.

### Must Implement

- Inisialisasi project backend Express.js.
- Struktur folder backend yang rapi.
- Setup environment config dengan dotenv.
- Setup PostgreSQL connection.
- Setup CORS.
- Health check endpoint.
- Database schema minimum untuk Sprint 1.
- Auth endpoint:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Password hashing dengan bcrypt.
- JWT generation dan verification.
- Middleware authentication.
- Middleware RBAC / role authorization.
- Protected route example untuk setiap role.
- README minimal.
- `.env.example`.
- Dokumentasi endpoint minimal atau Postman testing notes.

### Database Tables for Sprint 1

Create schema/migration for:

- `users`
- `roles`
- `sensor_nodes`
- `water_quality_readings`
- `alerts`
- `alert_thresholds`
- `water_tanks`
- `pumps`
- `billing_records`
- `service_requests`

`users` and `roles` must be functional for auth. Other tables may be basic schema/placeholders for next sprint.

---

## 3. Out of Scope

Do not implement features outside Sprint 1.

### Do Not Build Yet

- Dashboard kualitas air real-time.
- Full water quality API.
- Alert otomatis full.
- Firebase Cloud Messaging / FCM.
- MQTT relay execution.
- WebSocket real-time.
- Monitoring tangki full.
- Tank prediction service.
- Billing calculation.
- PDF export.
- Marketplace tukang full.
- Tracking mitra.
- GPS integration.
- NFC integration.
- ESP32-CAM upload.
- PIR verification.
- ML soil prediction.
- BMKG API integration.
- Admin dashboard lengkap.
- PWA/offline feature.
- Production deployment, unless explicitly requested.

If asked to implement one of the items above, stop and ask for confirmation because it is outside Sprint 1.

---

## 4. Backend Architecture Rules

Use a simple MVC / Clean Architecture-inspired structure. Keep it understandable and avoid unnecessary abstraction.

Recommended structure:

```txt
backend/
├─ src/
│  ├─ config/
│  │  ├─ env.js
│  │  └─ db.js
│  ├─ controllers/
│  │  ├─ auth.controller.js
│  │  └─ health.controller.js
│  ├─ routes/
│  │  ├─ auth.routes.js
│  │  ├─ health.routes.js
│  │  └─ protected.routes.js
│  ├─ middlewares/
│  │  ├─ authenticate.js
│  │  ├─ authorizeRole.js
│  │  └─ errorHandler.js
│  ├─ repositories/
│  │  ├─ user.repository.js
│  │  └─ role.repository.js
│  ├─ services/
│  │  ├─ auth.service.js
│  │  └─ token.service.js
│  ├─ database/
│  │  ├─ migrations/
│  │  └─ seeds/
│  ├─ utils/
│  │  ├─ apiResponse.js
│  │  ├─ constants.js
│  │  └─ password.js
│  ├─ app.js
│  └─ server.js
├─ docs/
├─ .env.example
├─ README.md
└─ package.json
```

### Layer Responsibility

- `routes`: define endpoint paths and attach middlewares/controllers.
- `controllers`: handle request/response only.
- `services`: contain business logic.
- `repositories`: contain database queries.
- `middlewares`: authentication, authorization, and error handling.
- `config`: environment and database configuration.
- `database`: migrations and seed scripts.
- `utils`: reusable helpers.
- `app.js`: Express app setup.
- `server.js`: server listener.

### Architecture Rules

- Keep controllers thin.
- Put auth logic in services.
- Put database queries in repositories.
- Do not put SQL queries directly inside routes.
- Do not mix routing, validation, database access, and response formatting in one file.
- Prefer clarity over abstraction.

---

## 5. Database Rules

Use PostgreSQL as backend database for Sprint 1.

### General Rules

- Use consistent table names in `snake_case`.
- Use consistent column names in `snake_case`.
- Every main table should have `id`, `created_at`, and optionally `updated_at`.
- Do not store plaintext passwords.
- Use foreign keys where the relationship is required.
- Keep schema simple enough for Sprint 1.

### Required Functional Tables

#### `roles`

Purpose: store available roles.

Minimum columns:

- `id`
- `code` unique, e.g. `WARGA`
- `name`
- `description` nullable
- `created_at`

#### `users`

Purpose: store user accounts for auth and RBAC.

Minimum columns:

- `id`
- `role_id` FK to `roles.id`
- `name`
- `email` unique
- `password_hash`
- `phone` nullable
- `is_active`
- `created_at`
- `updated_at`

### Required Placeholder Tables

Create simple schema for:

- `sensor_nodes`
- `water_quality_readings`
- `alerts`
- `alert_thresholds`
- `water_tanks`
- `pumps`
- `billing_records`
- `service_requests`

These tables do not need full feature logic in Sprint 1, but their schema should exist as foundation for later sprint.

### Seeder Rules

Seed default roles:

- `WARGA`
- `PENGURUS_RT_RW`
- `ADMIN_SISTEM`
- `MITRA_TUKANG`

Seed demo users only if needed for manual testing.

---

## 6. Authentication Rules

Authentication uses JWT and bcrypt.

### Register

- Public endpoint.
- Default registered role is `WARGA`.
- Validate required fields.
- Reject duplicate email.
- Hash password with bcrypt before storing.
- Never return `password_hash` in response.

### Login

- Public endpoint.
- Validate email and password.
- Compare password with bcrypt.
- Reject invalid credentials with generic error message.
- Generate JWT if credentials are valid.
- Return token and safe user object.

### Logout

- JWT is stateless for Sprint 1.
- Logout may simply return success response.
- Frontend is responsible for removing token.
- Do not implement token blacklist unless explicitly requested.

### Current User

- `GET /api/auth/me` must require Bearer token.
- Return safe user object only.
- Do not expose password hash.

### JWT Payload

Use minimal payload:

- `sub`: user id
- `email`: user email
- `role`: role code

Do not put sensitive data in JWT.

---

## 7. RBAC Rules

RBAC must be simple and explicit.

### Role Constants

Use these exact role codes:

```txt
WARGA
PENGURUS_RT_RW
ADMIN_SISTEM
MITRA_TUKANG
```

### Middleware Rules

Implement two middlewares:

1. `authenticate`
   - Reads `Authorization: Bearer <token>`.
   - Verifies JWT.
   - Attaches authenticated user payload to request.
   - Returns 401 if token missing or invalid.

2. `authorizeRole(...allowedRoles)`
   - Runs after `authenticate`.
   - Checks whether authenticated user role is allowed.
   - Returns 403 if role is not allowed.

### Protected Route Examples

Create example routes for manual testing:

- `GET /api/warga-only` → `WARGA`
- `GET /api/rt-rw-only` → `PENGURUS_RT_RW`
- `GET /api/admin-only` → `ADMIN_SISTEM`
- `GET /api/mitra-only` → `MITRA_TUKANG`

These routes are only proof that RBAC works.

---

## 8. API Response Standard

Use consistent API responses.

### Success Response

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": []
  }
}
```

### Auth Success Example

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "uuid-or-id",
      "name": "Budi",
      "email": "budi@example.com",
      "role": "WARGA"
    }
  }
}
```

Never return `password_hash`.

---

## 9. Error Handling Rules

Use clear status codes.

### Standard Status Codes

- `200 OK`: successful GET/login/logout.
- `201 Created`: successful register.
- `400 Bad Request`: validation error.
- `401 Unauthorized`: missing/invalid token or invalid credentials.
- `403 Forbidden`: authenticated but role not allowed.
- `404 Not Found`: resource not found.
- `409 Conflict`: duplicate email or unique constraint conflict.
- `500 Internal Server Error`: unexpected server error.

### Required Error Codes

Use consistent error code strings:

- `VALIDATION_ERROR`
- `EMAIL_ALREADY_EXISTS`
- `INVALID_CREDENTIALS`
- `TOKEN_MISSING`
- `TOKEN_INVALID`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `INTERNAL_SERVER_ERROR`

### Error Handling Rules

- Do not leak raw database errors to API response.
- Log enough information for debugging, but do not expose secrets.
- Use centralized error handling if possible.
- Keep error messages understandable for frontend.

---

## 10. Security Rules

### Must Follow

- Never commit `.env`.
- Always provide `.env.example`.
- Store JWT secret in environment variable.
- Hash passwords with bcrypt.
- Never return `password_hash` in API response.
- Validate input before database operation.
- Enable CORS using environment-based origin.
- Do not hardcode database credentials.
- Do not hardcode JWT secret.

### Optional / Future Improvement

- Rate limiting.
- Request sanitization package.
- Token blacklist.
- Refresh token.
- Device API key for IoT.
- Audit logs.

Do not implement optional items unless explicitly requested.

---

## 11. Testing Rules

Use manual testing with Postman or Thunder Client for Sprint 1.

### Required Manual Tests

1. Health check success.
2. Register success.
3. Register duplicate email returns 409.
4. Login success returns JWT.
5. Login with wrong password returns 401.
6. Access `/api/auth/me` without token returns 401.
7. Access `/api/auth/me` with valid token returns user.
8. Access role-protected route with wrong role returns 403.
9. Access role-protected route with correct role returns 200.
10. Confirm `password_hash` never appears in response.

### Testing Output

After coding, agent must explain:

- which endpoints to test,
- request body examples,
- expected status codes,
- expected success/error response.

---

## 12. Git/Commit Rules

### Commit Style

Use clear and meaningful commits.

Recommended examples:

```txt
chore: initialize express backend project
chore: configure environment and database connection
feat: add sprint 1 database schema
feat: add auth register and login
feat: add jwt authentication middleware
feat: add rbac role guard
feat: add protected route examples
```

### Git Rules

- Do not commit `.env`.
- Do commit `.env.example`.
- Do not make one giant commit if several logical changes are made.
- Keep commit messages meaningful.
- Do not rewrite unrelated files.
- Do not change frontend files unless explicitly requested.

---

## 13. Forbidden Actions

The AI agent must not do the following without explicit permission:

- Add new dependencies.
- Change tech stack.
- Build dashboard kualitas air.
- Build alert otomatis full.
- Implement FCM.
- Implement MQTT relay full.
- Implement WebSocket.
- Implement billing calculation.
- Implement PDF export.
- Implement marketplace tukang full.
- Implement tracking mitra.
- Implement GPS, NFC, ESP32-CAM, PIR, or ML features.
- Implement production deployment.
- Create overly complex architecture.
- Add microservices.
- Add queue system.
- Add Redis.
- Add Docker unless requested.
- Store secrets in code.
- Return password hash in API response.
- Rename role values without confirmation.
- Modify Jira/task docs automatically.
- Make broad refactors unrelated to Sprint 1.

If a requested task appears outside Sprint 1, agent must stop and ask for confirmation.

---

## 14. Workflow Rules for AI Agent

### Before Coding

The AI agent must first explain:

1. What files will be created or changed.
2. What task is being addressed: `SYNC-59` or `SYNC-60`.
3. What implementation steps will be taken.
4. Any assumptions being made.
5. Any dependencies or missing information.

Do not start coding before giving a concise implementation plan.

### During Coding

The AI agent must:

- Stay within Sprint 1 scope.
- Prefer simple and readable code.
- Keep controllers thin.
- Keep services focused.
- Keep database queries organized.
- Use consistent response format.
- Use clear naming.
- Avoid unnecessary abstractions.
- Avoid adding dependency without permission.

### After Coding

The AI agent must report:

1. Files created.
2. Files modified.
3. What was implemented.
4. How to run the backend.
5. How to test manually with Postman.
6. Known limitations.
7. Next recommended step.

### If Blocked

The AI agent must clearly state:

- what is blocked,
- why it is blocked,
- what information is needed,
- who should be asked,
- safe temporary fallback if available.

### If Asked to Do More Than Sprint 1

The AI agent must respond with a scope warning:

```txt
This request is outside Sprint 1 backend scope. Sprint 1 is limited to backend foundation, database schema, auth JWT, and RBAC. Please confirm if you still want to proceed.
```

---

## Final Instruction

For Sprint 1, prioritize:

1. Backend project setup.
2. PostgreSQL connection.
3. Database schema.
4. Auth API.
5. JWT middleware.
6. RBAC middleware.
7. Protected route examples.
8. README and manual testing notes.

Do not optimize prematurely. Do not build advanced features. Make the backend foundation clean, working, and easy for the team to continue.
