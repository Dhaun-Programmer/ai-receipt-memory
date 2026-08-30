const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const memoryService = require('../services/memoryService');
const Receipt = require('../models/Receipt');

const router = express.Router();

const upload = require('../config/cloudinary');

router.post('/analyze-receipt', auth, upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a receipt image' });

    const imagePath = path.join(__dirname, '../uploads', req.file.filename);
    const analysis = await aiService.analyzeReceipt(imagePath);

    const receipt = new Receipt({
      userId: req.userId,
      imageUrl: `/uploads/${req.file.filename}`,
      storeName: analysis.storeName || 'Unknown Store',
      purchaseDate: analysis.purchaseDate ? new Date(analysis.purchaseDate) : new Date(),
      receiptNumber: analysis.receiptNumber || '',
      totalAmount: analysis.totalAmount || 0,
      currency: analysis.currency || 'INR',
      paymentMethod: analysis.paymentMethod || 'Not detected',
      items: (analysis.items || []).map(item => ({
        name: item.name || 'Unknown Item',
        category: item.category || 'Other',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        totalPrice: item.totalPrice || 0,
        warrantyPeriod: item.warrantyPeriod || 'Not mentioned',
        warrantyExpiry: item.warrantyExpiry ? new Date(item.warrantyExpiry) : null,
        returnPeriod: item.returnPeriod || 'Not mentioned',
        returnDeadline: item.returnDeadline ? new Date(item.returnDeadline) : null
      })),
      confidence: analysis.confidence || 0,
      status: 'pending'
    });

    await receipt.save();
    res.json({ receipt, analysis });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ message: 'Failed to analyze receipt. Please try again.' });
  }
});

router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const purchases = await memoryService.searchRelevantPurchases(req.userId, message);
    const response = await aiService.chat(message, purchases);

    res.json({ response, purchasesUsed: purchases.length });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Failed to process your question. Please try again.' });
  }
});

module.exports = router;
