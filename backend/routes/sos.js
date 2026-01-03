const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendSOS } = require('../controllers/sosController');

// Controllers will be implemented later
// POST /api/sos
router.post('/', auth, sendSOS);

module.exports = router;
