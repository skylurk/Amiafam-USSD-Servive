const { con, end } = require('../utils/ussdResponse');
const { createUser } = require('../services/userService');

const OCCUPATIONS = ['Rider', 'Street Vendor', 'Mechanic/Artisan', 'Other'];

const handle = (inputs, phoneNumber) => {
  const level = inputs.length;

  // Step 1: Ask for full name
  if (level === 0) {
    return con(`Welcome to Amiafam Scheme!\n\nPlease enter your full name:`);
  }

  // Step 2: Ask for ID number
  if (level === 1) {
    return con(`Enter your ID number:`);
  }

  // Step 3: Select occupation
  if (level === 2) {
    return con(
      `Select your occupation:\n1. Rider\n2. Street Vendor\n3. Mechanic/Artisan\n4. Other`
    );
  }

  // Step 4: Confirm — show summary + consent
  if (level === 3) {
    const occupationIndex = parseInt(inputs[2]) - 1;

    if (isNaN(occupationIndex) || !OCCUPATIONS[occupationIndex]) {
      return con(
        `Invalid selection. Select your occupation:\n1. Rider\n2. Street Vendor\n3. Mechanic/Artisan\n4. Other`
      );
    }

    const fullName = inputs[0];
    const idNumber = inputs[1];
    const occupation = OCCUPATIONS[occupationIndex];

    return con(
      `Confirm your details:\n` +
      `Name: ${fullName}\n` +
      `ID: ${idNumber}\n` +
      `Occupation: ${occupation}\n\n` +
      `By continuing you consent to our data privacy policy: amiafam.com/privacy\n\n` +
      `1. Confirm & Pay\n2. Cancel`
    );
  }

  // Step 5: Handle confirmation
  if (level === 4) {
    const choice = inputs[3];

    if (choice === '2') {
      return end(`Registration cancelled. Dial again to restart.`);
    }

    if (choice === '1') {
      const occupationIndex = parseInt(inputs[2]) - 1;
      const userData = {
        phoneNumber,
        fullName: inputs[0],
        idNumber: inputs[1],
        occupation: OCCUPATIONS[occupationIndex],
      };

      // Save user and trigger STK (async — handled separately)
      saveAndPay(userData);

      return end(
        `Registration successful!\n\nAn Mpesa prompt has been sent to ${phoneNumber}. Complete payment to activate your account.`
      );
    }

    return con(
      `Invalid choice.\n1. Confirm & Pay\n2. Cancel`
    );
  }

  return end(`Something went wrong. Please try again.`);
};

// Fire-and-forget: save user + trigger STK push
const saveAndPay = async (userData) => {
  try {
    await createUser(userData);
    // STK push will go here once stkService is ready
    console.log(`🔔 STK push pending for ${userData.phoneNumber}`);
  } catch (err) {
    console.error('Registration save error:', err.message);
  }
};

module.exports = { handle };