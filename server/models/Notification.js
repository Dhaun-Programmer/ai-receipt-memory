const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['warranty_expiring', 'warranty_expired', 'return_deadline', 'general'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedPurchaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Receipt' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
