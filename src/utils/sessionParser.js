// Parses AT's text trail into an array of inputs
// "" → [], "1" → ["1"], "1*2" → ["1", "2"]
const parseSession = (text) => {
  if (!text || text === '') return [];
  return text.split('*');
};

module.exports = { parseSession };