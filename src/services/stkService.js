// Stub — full implementation will be a separate app
const triggerSTK = ({ phoneNumber, amount, userId }) => {
  console.log(`🔔 STK Push triggered:`);
  console.log(`   Phone  : ${phoneNumber}`);
  console.log(`   Amount : ${amount === 'outstanding' ? 'Outstanding balance' : `KES ${amount}`}`);
  console.log(`   User ID: ${userId}`);
  // TODO: Call STK push service here
};

module.exports = { triggerSTK };