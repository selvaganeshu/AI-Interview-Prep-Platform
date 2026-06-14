const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getProfilePerformance } = require('../controllers/profileController');

const router = express.Router();

router.get('/performance', protect, getProfilePerformance);

module.exports = router;
