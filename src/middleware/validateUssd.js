const validateUssd = (req, res, next) => {
  const { sessionId, phoneNumber, text } = req.body;

  if (!sessionId || !phoneNumber) {
    return res.status(200).send('END Invalid request.');
  }

  next();
};

module.exports = validateUssd;