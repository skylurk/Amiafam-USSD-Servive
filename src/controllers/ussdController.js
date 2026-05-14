const { parseSession } = require('../utils/sessionParser');
const { con, end } = require('../utils/ussdResponse');
const { findUserByPhone } = require('../services/userService');
const registrationController = require('./registrationController');
const accountController = require('./accountController');

const TOP_MENU = `CON Welcome to Amiafam\n1. Amiafam Scheme\n2. Find Specialist`;

const handleUssd = async (req, res) => {
  const { sessionId, phoneNumber, text } = req.body;
  const inputs = parseSession(text);

  res.set('Content-Type', 'text/plain');

  try {
    // Show top-level menu
    if (inputs.length === 0) {
      return res.send(TOP_MENU);
    }

    const topChoice = inputs[0];

    // ── Option 2: Find Specialist
    if (topChoice === '2') {
      return res.send(
        end('Find a Specialist\nVisit us at: amiafam.com\nOr call: 0800 000 000')
      );
    }

    // ── Option 1: Amiafam Scheme
    if (topChoice === '1') {
      // Sub-inputs are everything after the top-level choice
      const subInputs = inputs.slice(1);
      const user = await findUserByPhone(phoneNumber);

      if (!user) {
        return res.send(registrationController.handle(subInputs, phoneNumber));
      }

      return res.send(await accountController.handle(subInputs, user));
    }

    return res.send(end('Invalid option. Please try again.'));

  } catch (err) {
    console.error('USSD error:', err.message);
    return res.send(end('Something went wrong. Please try again.'));
  }
};

module.exports = { handleUssd };