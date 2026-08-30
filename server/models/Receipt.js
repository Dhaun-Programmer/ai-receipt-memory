const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Other' },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  warrantyPeriod: { type: String, default: 'Not mentioned' },
  warrantyExpiry: { type: Date, default: null },
  returnPeriod: { type: String, default: 'Not mentioned' },
  returnDeadline: { type: Date, default: null }
}, { _id: true });

const receiptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  imageUrl: { type: String },
  storeName: { type: String, default: 'Unknown Store' },
  purchaseDate: { type: Date, default: Date.now },
  receiptNumber: { type: String, default: '' },
  totalAmount: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  paymentMethod: { type: String, default: 'Not detected' },
  items: [itemSchema],
  confidence: { type: Number, default: 0 },
  rawText: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

receiptSchema.index({ userId: 1, storeName: 'text', receiptNumber: 'text' });
receiptSchema.index({ userId: 1, purchaseDate: -1 });
receiptSchema.index({ userId: 1, 'items.category': 1 });

module.exports = mongoose.model('Receipt', receiptSchema);
