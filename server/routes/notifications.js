const express = require('express');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const Receipt = require('../models/Receipt');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.userId, isRead: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/read', auth, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.userId, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { isRead: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/generate', auth, async (req, res) => {
  try {
    const receipts = await Receipt.find({ userId: req.userId, status: 'confirmed' });
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const notifications = [];

    for (const receipt of receipts) {
      for (const item of receipt.items) {
        if (item.warrantyExpiry) {
          const expiry = new Date(item.warrantyExpiry);
          if (expiry > now && expiry <= sevenDays) {
            const existing = await Notification.findOne({ userId: req.userId, relatedPurchaseId: receipt._id, type: 'warranty_expiring', title: { $regex: item.name } });
            if (!existing) {
              notifications.push(new Notification({
                userId: req.userId, type: 'warranty_expiring',
                title: `Warranty Expiring: ${item.name}`,
                message: `Warranty for ${item.name} expires on ${expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
                relatedPurchaseId: receipt._id
              }));
            }
          }
          if (expiry <= now) {
            const existing = await Notification.findOne({ userId: req.userId, relatedPurchaseId: receipt._id, type: 'warranty_expired', title: { $regex: item.name } });
            if (!existing) {
              notifications.push(new Notification({
                userId: req.userId, type: 'warranty_expired',
                title: `Warranty Expired: ${item.name}`,
                message: `Warranty for ${item.name} has expired.`,
                relatedPurchaseId: receipt._id
              }));
            }
          }
        }
        if (item.returnDeadline) {
          const deadline = new Date(item.returnDeadline);
          if (deadline > now && deadline <= sevenDays) {
            const existing = await Notification.findOne({ userId: req.userId, relatedPurchaseId: receipt._id, type: 'return_deadline', title: { $regex: item.name } });
            if (!existing) {
              notifications.push(new Notification({
                userId: req.userId, type: 'return_deadline',
                title: `Return Deadline: ${item.name}`,
                message: `Return deadline for ${item.name} is ${deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
                relatedPurchaseId: receipt._id
              }));
            }
          }
        }
      }
    }

    await Notification.insertMany(notifications);
    res.json({ generated: notifications.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
