const db = require('../../config/db');

const deactivateInactiveUsers = async () => {
  try {
    const result = await db.query(
      `UPDATE users
       SET status = 'inactive'
       WHERE status = 'active'
       AND (
         last_payment_at IS NULL 
         OR last_payment_at < NOW() - INTERVAL '3 days'
       )`
    );
    console.log(`⚠️  Deactivated ${result.rowCount} inactive users`);
  } catch (err) {
    console.error('Status job error:', err.message);
  }
};

module.exports = { deactivateInactiveUsers };