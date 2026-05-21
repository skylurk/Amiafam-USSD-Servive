const db = require('../../config/db');

const findUserByPhone = async (phoneNumber) => {
  const result = await db.query(
    'SELECT * FROM users WHERE phone_number = $1',
    [phoneNumber]
  );
  return result.rows[0] || null;
};

const createUser = async ({ phoneNumber, fullName, idNumber, occupation }) => {
  const result = await db.query(
    `INSERT INTO users (phone_number, full_name, id_number, occupation, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [phoneNumber, fullName, idNumber, occupation]
  );
  return result.rows[0];
};

module.exports = { findUserByPhone, createUser };