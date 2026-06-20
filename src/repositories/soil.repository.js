const { query } = require('../config/db');

async function findLatestSoilReadings() {
  const result = await query(
    `SELECT DISTINCT ON (ssn.id)
       smr.id,
       ssn.node_code,
       ssn.location_name,
       ssn.latitude,
       ssn.longitude,
       smr.moisture_percentage,
       smr.recorded_at,
       smr.received_at
     FROM soil_sensor_nodes ssn
     JOIN soil_moisture_readings smr ON smr.node_id = ssn.id
     WHERE ssn.is_active = TRUE
     ORDER BY ssn.id, smr.received_at DESC, smr.id DESC`,
  );

  return result.rows;
}

module.exports = {
  findLatestSoilReadings,
};
