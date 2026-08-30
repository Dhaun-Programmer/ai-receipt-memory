const express = require('express');
const auth = require('../middleware/auth');
const Receipt = require('../models/Receipt');

const router = express.Router();

router.get('/summary', auth, async (req, res) => {
  try {
    const receipts = await Receipt.find({ userId: req.userId, status: 'confirmed' });
    const now = new Date();
    const thisMonth = receipts.filter(r => {
      const d = new Date(r.purchaseDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    let activeWarranties = 0;
    let expiringSoon = 0;
    receipts.forEach(r => r.items.forEach(i => {
      if (i.warrantyExpiry) {
        const exp = new Date(i.warrantyExpiry);
        if (exp > now) activeWarranties++;
        if (exp > now && exp <= thirtyDays) expiringSoon++;
      }
    }));

    res.json({
      totalPurchases: receipts.length,
      totalSpending: receipts.reduce((s, r) => s + r.totalAmount, 0),
      thisMonthSpending: thisMonth.reduce((s, r) => s + r.totalAmount, 0),
      thisMonthCount: thisMonth.length,
      activeWarranties,
      expiringSoon
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/monthly', auth, async (req, res) => {
  try {
    const receipts = await Receipt.find({ userId: req.userId, status: 'confirmed' });
    const monthly = {};
    receipts.forEach(r => {
      const d = new Date(r.purchaseDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[key]) monthly[key] = { month: key, amount: 0, count: 0 };
      monthly[key].amount += r.totalAmount;
      monthly[key].count++;
    });
    res.json({ monthly: Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/categories', auth, async (req, res) => {
  try {
    const receipts = await Receipt.find({ userId: req.userId, status: 'confirmed' });
    const categories = {};
    receipts.forEach(r => r.items.forEach(i => {
      const cat = i.category || 'Other';
      if (!categories[cat]) categories[cat] = { category: cat, amount: 0, count: 0 };
      categories[cat].amount += i.totalPrice;
      categories[cat].count++;
    }));
    res.json({ categories: Object.values(categories).sort((a, b) => b.amount - a.amount) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stores', auth, async (req, res) => {
  try {
    const receipts = await Receipt.find({ userId: req.userId, status: 'confirmed' });
    const stores = {};
    receipts.forEach(r => {
      const store = r.storeName || 'Unknown';
      if (!stores[store]) stores[store] = { store, amount: 0, count: 0 };
      stores[store].amount += r.totalAmount;
      stores[store].count++;
    });
    res.json({ stores: Object.values(stores).sort((a, b) => b.amount - a.amount) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
