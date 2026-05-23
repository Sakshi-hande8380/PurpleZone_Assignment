const express = require('express');
const router = express.Router();
const { getStatements, submitCorrections } = require('../controllers/statementController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getStatements);
router.post('/submit', protect, submitCorrections);

module.exports = router;
