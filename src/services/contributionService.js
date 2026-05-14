const db = require('../../config/db');

const getStatus = async (userId) => {
  const result = await db.query(
    'SELECT status FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0]?.status || 'inactive';
};

const getTotalContributions = async (userId) => {
  const result = await db.query(
    'SELECT COALESCE(SUM(amount), 0) AS total FROM contributions WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.total || 0;
};

const getLastPayment = async (userId) => {
  const result = await db.query(
    `SELECT amount, paid_at FROM contributions 
     WHERE user_id = $1 
     ORDER BY paid_at DESC 
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] || null;
};

const saveContribution = async ({ userId, amount, paymentReference }) => {
  const result = await db.query(
    `INSERT INTO contributions (user_id, amount, payment_reference)
     VALUES ($1, $2, $3) RETURNING *`,
    [userId, amount, paymentReference]
  );

  // Update last_payment_at on user
  await db.query(
    `UPDATE users SET last_payment_at = NOW(), status = 'active' WHERE id = $1`,
    [userId]
  );

  return result.rows[0];
};

module.exports = { getStatus, getTotalContributions, getLastPayment, saveContribution };