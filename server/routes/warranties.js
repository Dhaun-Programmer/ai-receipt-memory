const express = require('express');
const auth = require('../middleware/auth');
const memoryService = require('../services/memoryService');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const warranties = await memoryService.getWarrantyInfo(req.userId);
    res.json({ warranties });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/expiring', auth, async (req, res) => {
  try {
    const warranties = await memoryService.getWarrantyInfo(req.userId);
    const expiring = warranties.filter(w => w.status === 'expiring_soon');
    res.json({ warranties: expiring });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/returns', auth, async (req, res) => {
  try {
    const returns = await memoryService.getReturnInfo(req.userId);
    res.json({ returns });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
