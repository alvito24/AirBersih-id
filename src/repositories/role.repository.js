const db = require('../config/db');

async function findByCode(code) {
  const result = await db.query(
    'SELECT id, code, name, description FROM roles WHERE code = $1',
    [code]
  );

  return result.rows[0] || null;
}

module.exports = {
  findByCode,
};
