const express = require('express');
const bodyParser = require('body-parser');
const ussdRoutes = require('./src/routes/ussdRoutes');
const { handleUssd } = require('./src/controllers/ussdController');
const validateUssd = require('./src/middleware/validateUssd');
const { deactivateInactiveUsers } = require('./src/utils/statusJob');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handle both / and /ussd — AT sandbox sometimes strips the path
app.post('/', validateUssd, handleUssd);
app.use('/ussd', ussdRoutes);

app.get('/', (req, res) => res.send('Amiafam USSD Service'));

setInterval(deactivateInactiveUsers, 60 * 60 * 1000);
deactivateInactiveUsers();

module.exports = app;