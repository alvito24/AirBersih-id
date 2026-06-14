const db = require('../config/db');

const SAFE_USER_COLUMNS = `
  users.id,
  users.name,
  users.email,
  users.phone,
  users.address,
  users.is_active,
  roles.code AS role,
  roles.name AS role_name
`;

const USER_JOIN_ROLE = `
  FROM users
  JOIN roles ON roles.id = users.role_id
`;

async function findByEmail(email) {
  const result = await db.query(
    `SELECT ${SAFE_USER_COLUMNS}, users.password_hash
     ${USER_JOIN_ROLE}
     WHERE users.email = $1`,
    [email]
  );

  return result.rows[0] || null;
}

async function findSafeById(id) {
  const result = await db.query(
    `SELECT ${SAFE_USER_COLUMNS}
     ${USER_JOIN_ROLE}
     WHERE users.id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function createUser({ roleId, name, email, passwordHash, phone, address }) {
  const result = await db.query(
    `INSERT INTO users (role_id, name, email, password_hash, phone, address)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [roleId, name, email, passwordHash, phone, address]
  );

  return findSafeById(result.rows[0].id);
}

module.exports = {
  findByEmail,
  findSafeById,
  createUser,
};
