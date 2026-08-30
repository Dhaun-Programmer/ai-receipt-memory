const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Receipt = require('../models/Receipt');

const router = express.Router();

const upload = require('../config/cloudinary');

router.post('/upload', auth, upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload an image' });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl, filename: req.file.filename });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { search, category, store, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20, startDate, endDate, minPrice, maxPrice } = req.query;
    const query = { userId: req.userId, status: 'confirmed' };

    if (search) {
      query.$or = [
        { storeName: { $regex: search, $options: 'i' } },
        { receiptNumber: { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query['items.category'] = category;
    if (store) query.storeName = { $regex: store, $options: 'i' };
    if (startDate || endDate) {
      query.purchaseDate = {};
      if (startDate) query.purchaseDate.$gte = new Date(startDate);
      if (endDate) query.purchaseDate.$lte = new Date(endDate);
    }
    if (minPrice || maxPrice) {
      query.totalAmount = {};
      if (minPrice) query.totalAmount.$gte = parseFloat(minPrice);
      if (maxPrice) query.totalAmount.$lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [receipts, total] = await Promise.all([
      Receipt.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
      Receipt.countDocuments(query)
    ]);

    res.json({ receipts, total, pages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/pending', auth, async (req, res) => {
  try {
    const receipts = await Receipt.find({ userId: req.userId, status: 'pending' }).sort({ createdAt: -1 });
    res.json({ receipts });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const receipt = await Receipt.findOne({ _id: req.params.id, userId: req.userId });
    if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
    res.json({ receipt });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const receipt = await Receipt.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
    res.json({ receipt });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/confirm', auth, async (req, res) => {
  try {
    const receipt = await Receipt.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status: 'confirmed', ...req.body },
      { new: true }
    );
    if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
    res.json({ receipt });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const receipt = await Receipt.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
    res.json({ message: 'Receipt deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
