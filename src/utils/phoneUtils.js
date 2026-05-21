// Normalises Kenyan phone numbers to E.164 (+254XXXXXXXXX).
// Accepts: 07XXXXXXXX, 01XXXXXXXX, 254XXXXXXXXX, +254XXXXXXXXX
// Returns null for unrecognised formats.
const normalisePhone = (raw) => {
  const s = raw.trim();
  if (/^0[17]\d{8}$/.test(s)) return `+254${s.slice(1)}`;
  if (/^254\d{9}$/.test(s))   return `+${s}`;
  if (/^\+254\d{9}$/.test(s)) return s;
  return null;
};

module.exports = { normalisePhone };
