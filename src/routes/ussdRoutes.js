const express = require('express');
const router = express.Router();
const { handleUssd } = require('../controllers/ussdController');
const validateUssd = require('../middleware/validateUssd');

router.post('/', validateUssd, handleUssd);

module.exports = router;