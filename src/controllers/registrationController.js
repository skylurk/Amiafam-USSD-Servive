const { con, end } = require('../utils/ussdResponse');
const { createUser } = require('../services/userService');

const OCCUPATIONS = ['Rider', 'Street Vendor', 'Mechanic/Artisan', 'Other'];

const handle = async (inputs, phoneNumber) => {
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
    const fullName = inputs[0].trim();
    const idNumber = inputs[1].trim();
    const occupationIndex = parseInt(inputs[2]) - 1;
    const occupation = OCCUPATIONS[occupationIndex];

    if (fullName.length > 50)  return end(`Name too long. Please dial again.`);
    if (idNumber.length > 15)  return end(`ID number too long. Please dial again.`);
    if (isNaN(occupationIndex) || !occupation) {
      return end(`Invalid occupation selected. Please dial again.`);
    }

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
      const fullName = inputs[0].trim();
      const idNumber = inputs[1].trim();
      const occupationIndex = parseInt(inputs[2]) - 1;
      const occupation = OCCUPATIONS[occupationIndex];

      if (fullName.length > 50)  return end(`Name too long. Please dial again.`);
      if (idNumber.length > 15)  return end(`ID number too long. Please dial again.`);
      if (isNaN(occupationIndex) || !occupation) {
        return end(`Invalid occupation selected. Please dial again.`);
      }

      try {
        await createUser({ phoneNumber, fullName, idNumber, occupation });
        console.log(`🔔 STK push pending for ${phoneNumber}`);
        return end(
          `Registration successful!\n\nAn Mpesa prompt has been sent to ${phoneNumber}. Complete payment to activate your account.`
        );
      } catch (err) {
        console.error('Registration save error:', err.message);
        return end(`Registration failed. Your phone or ID may already be registered. Please try again.`);
      }
    }

    return con(
      `Invalid choice.\n1. Confirm & Pay\n2. Cancel`
    );
  }

  return end(`Something went wrong. Please try again.`);
};

module.exports = { handle };