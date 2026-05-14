const { con, end } = require('../utils/ussdResponse');
const { getStatus, getTotalContributions, getLastPayment } = require('../services/contributionService');
const { triggerSTK } = require('../services/stkService');
const { createUser } = require('../services/userService');

const MAIN_MENU = `CON Account\n1. Register on Behalf\n2. Contribution\n3. My Status\n4. Emergency Help\n5. Information`;

const handle = async (inputs, user) => {
  if (inputs.length === 0) return MAIN_MENU;

  const choice = inputs[0];

  switch (choice) {
    case '1': return await handleRegisterOnBehalf(inputs, user);
    case '2': return await handleContribution(inputs, user);
    case '3': return await handleMyStatus(inputs, user);
    case '4': return handleEmergency();
    case '5': return handleInformation();
    default:  return end('Invalid option. Please try again.');
  }
};

// ─── Register on Behalf ───────────────────────────────────────────
const handleRegisterOnBehalf = async (inputs, user) => {
  if (inputs.length === 1) return con('Enter their phone number:');
  if (inputs.length === 2) return con('Enter their full name:');
  if (inputs.length === 3) return con('Enter their ID number:');
  if (inputs.length === 4)
    return con('Select occupation:\n1. Rider\n2. Street Vendor\n3. Mechanic/Artisan\n4. Other');

  if (inputs.length === 5) {
    const OCCUPATIONS = ['Rider', 'Street Vendor', 'Mechanic/Artisan', 'Other'];
    const occIndex = parseInt(inputs[4]) - 1;
    if (isNaN(occIndex) || !OCCUPATIONS[occIndex])
      return con('Invalid. Select occupation:\n1. Rider\n2. Street Vendor\n3. Mechanic/Artisan\n4. Other');

    return con(
      `Confirm:\nPhone: ${inputs[1]}\nName: ${inputs[2]}\nID: ${inputs[3]}\nOccupation: ${OCCUPATIONS[occIndex]}\n\n1. Confirm\n2. Cancel`
    );
  }

  if (inputs.length === 6) {
    if (inputs[5] === '2') return end('Registration cancelled.');
    if (inputs[5] === '1') {
      const OCCUPATIONS = ['Rider', 'Street Vendor', 'Mechanic/Artisan', 'Other'];
      try {
        await createUser({
          phoneNumber: inputs[1],
          fullName: inputs[2],
          idNumber: inputs[3],
          occupation: OCCUPATIONS[parseInt(inputs[4]) - 1],
        });
        return end(`${inputs[2]} has been registered successfully.`);
      } catch (err) {
        return end('Registration failed. Phone or ID may already exist.');
      }
    }
  }

  return end('Invalid option.');
};

// ─── Contribution ─────────────────────────────────────────────────
const handleContribution = async (inputs, user) => {
  if (inputs.length === 1)
    return con('Contribution\nChoose amount:\n1. KES 50\n2. KES 100\n3. Enter Amount\n4. Clear Outstanding');

  const amountChoice = inputs[1];
  let amount = null;

  if (amountChoice === '1') amount = 50;
  if (amountChoice === '2') amount = 100;

  if (amountChoice === '3') {
    if (inputs.length === 2) return con('Enter amount (KES):');
    amount = parseFloat(inputs[2]);
    if (isNaN(amount) || amount <= 0) return con('Invalid amount.\nEnter amount (KES):');
  }

  if (amountChoice === '4') {
    // Clear outstanding — fixed amount from backend (stub for now)
    amount = 'outstanding';
  }

  // Confirmation step
  const confirmIndex = amountChoice === '3' ? 3 : 2;

  if (inputs.length === confirmIndex) {
    const display = amount === 'outstanding' ? 'your outstanding balance' : `KES ${amount}`;
    return con(`Send Mpesa STK push for ${display} to ${user.phone_number}?\n\n1. Confirm\n2. Cancel`);
  }

  if (inputs.length === confirmIndex + 1) {
    const confirmChoice = inputs[confirmIndex];
    if (confirmChoice === '2') return end('Payment cancelled.');
    if (confirmChoice === '1') {
      triggerSTK({ phoneNumber: user.phone_number, amount, userId: user.id });
      return end(`Mpesa prompt sent to ${user.phone_number}.\nComplete payment to confirm contribution.`);
    }
  }

  return end('Invalid option.');
};

// ─── My Status ───────────────────────────────────────────────────
const handleMyStatus = async (inputs, user) => {
  if (inputs.length === 1)
    return con('My Status\n1. Account Status\n2. Total Contribution\n3. Last Payment');

  const choice = inputs[1];

  if (choice === '1') {
    const status = await getStatus(user.id);
    return end(`Account Status: ${status.toUpperCase()}`);
  }

  if (choice === '2') {
    const total = await getTotalContributions(user.id);
    return end(`Total Contributions: KES ${total}`);
  }

  if (choice === '3') {
    const last = await getLastPayment(user.id);
    if (!last) return end('No payments found.');
    return end(`Last Payment: KES ${last.amount}\nDate: ${new Date(last.paid_at).toDateString()}`);
  }

  return end('Invalid option.');
};

// ─── Emergency Help ───────────────────────────────────────────────
const handleEmergency = () =>
  end('Emergency Help\nCall: 0800 000 000 (Toll Free)\nWhatsApp: +254700000000\nEmail: help@amiafam.com');

// ─── Information ──────────────────────────────────────────────────
const handleInformation = () =>
  end('Amiafam Scheme\nA community welfare fund for the informal sector.\nLearn more: amiafam.com\nEmail: info@amiafam.com');

module.exports = { handle };

