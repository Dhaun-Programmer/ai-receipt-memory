require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Receipt = require('../models/Receipt');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let user = await User.findOne({ email: 'demo@receipt.com' });
    if (!user) {
      user = await User.create({ name: 'Demo User', email: 'demo@receipt.com', password: 'password123' });
      console.log('Created demo user');
    }

    await Receipt.deleteMany({ userId: user._id });

    const receipts = [
      {
        userId: user._id, imageUrl: '', storeName: 'Nike Store',
        purchaseDate: new Date('2026-08-10'), receiptNumber: 'NK-2026-0810-001',
        totalAmount: 3499, currency: 'INR', paymentMethod: 'UPI',
        items: [{ name: 'Running Shoes', category: 'Footwear', quantity: 1, unitPrice: 3499, totalPrice: 3499, warrantyPeriod: '1 year', warrantyExpiry: new Date('2027-08-10'), returnPeriod: '7 days', returnDeadline: new Date('2026-08-17') }],
        confidence: 0.92, status: 'confirmed'
      },
      {
        userId: user._id, imageUrl: '', storeName: 'Amazon',
        purchaseDate: new Date('2026-07-28'), receiptNumber: 'AMZ-2026-0728-042',
        totalAmount: 7999, currency: 'INR', paymentMethod: 'Credit Card',
        items: [{ name: 'Sony WH-1000XM5 Headphones', category: 'Electronics', quantity: 1, unitPrice: 7999, totalPrice: 7999, warrantyPeriod: '1 year', warrantyExpiry: new Date('2027-07-28'), returnPeriod: '10 days', returnDeadline: new Date('2026-08-07') }],
        confidence: 0.88, status: 'confirmed'
      },
      {
        userId: user._id, imageUrl: '', storeName: 'Flipkart',
        purchaseDate: new Date('2026-08-05'), receiptNumber: 'FK-2026-0805-123',
        totalAmount: 2499, currency: 'INR', paymentMethod: 'UPI',
        items: [{ name: 'Dell KB216 Keyboard', category: 'Electronics', quantity: 1, unitPrice: 2499, totalPrice: 2499, warrantyPeriod: '6 months', warrantyExpiry: new Date('2027-02-05'), returnPeriod: '7 days', returnDeadline: new Date('2026-08-12') }],
        confidence: 0.85, status: 'confirmed'
      },
      {
        userId: user._id, imageUrl: '', storeName: 'Reliance Digital',
        purchaseDate: new Date('2026-06-15'), receiptNumber: 'RD-2026-0615-078',
        totalAmount: 45999, currency: 'INR', paymentMethod: 'Credit Card',
        items: [{ name: 'Samsung Galaxy S24', category: 'Electronics', quantity: 1, unitPrice: 45999, totalPrice: 45999, warrantyPeriod: '1 year', warrantyExpiry: new Date('2027-06-15'), returnPeriod: '7 days', returnDeadline: new Date('2026-06-22') }],
        confidence: 0.91, status: 'confirmed'
      },
      {
        userId: user._id, imageUrl: '', storeName: 'Westside',
        purchaseDate: new Date('2026-08-01'), receiptNumber: 'WS-2026-0801-015',
        totalAmount: 2199, currency: 'INR', paymentMethod: 'Cash',
        items: [{ name: 'Cotton Kurta Set', category: 'Clothing', quantity: 1, unitPrice: 2199, totalPrice: 2199, warrantyPeriod: 'Not mentioned', warrantyExpiry: null, returnPeriod: '15 days', returnDeadline: new Date('2026-08-16') }],
        confidence: 0.78, status: 'confirmed'
      },
      {
        userId: user._id, imageUrl: '', storeName: 'BigBasket',
        purchaseDate: new Date('2026-08-20'), receiptNumber: 'BB-2026-0820-301',
        totalAmount: 856, currency: 'INR', paymentMethod: 'UPI',
        items: [
          { name: 'Organic Rice 5kg', category: 'Grocery', quantity: 1, unitPrice: 420, totalPrice: 420, warrantyPeriod: 'Not mentioned', warrantyExpiry: null, returnPeriod: 'Not mentioned', returnDeadline: null },
          { name: 'Almond Milk 1L', category: 'Grocery', quantity: 2, unitPrice: 85, totalPrice: 170, warrantyPeriod: 'Not mentioned', warrantyExpiry: null, returnPeriod: 'Not mentioned', returnDeadline: null },
          { name: 'Brown Bread', category: 'Grocery', quantity: 3, unitPrice: 45, totalPrice: 135, warrantyPeriod: 'Not mentioned', warrantyExpiry: null, returnPeriod: 'Not mentioned', returnDeadline: null }
        ],
        confidence: 0.95, status: 'confirmed'
      },
      {
        userId: user._id, imageUrl: '', storeName: 'Lenskart',
        purchaseDate: new Date('2026-07-10'), receiptNumber: 'LK-2026-0710-045',
        totalAmount: 3299, currency: 'INR', paymentMethod: 'UPI',
        items: [{ name: 'Blue Light Glasses', category: 'Other', quantity: 1, unitPrice: 3299, totalPrice: 3299, warrantyPeriod: '1 year', warrantyExpiry: new Date('2027-07-10'), returnPeriod: '14 days', returnDeadline: new Date('2026-07-24') }],
        confidence: 0.87, status: 'confirmed'
      }
    ];

    await Receipt.insertMany(receipts);
    console.log(`Seeded ${receipts.length} receipts for demo user`);
    console.log('Login with: demo@receipt.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
