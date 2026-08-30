console.log('=== SERVER STARTING ===');
console.log('Node version:', process.version);
console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);

try {
  require('dotenv').config();
  console.log('dotenv loaded');

  const express = require('express');
  console.log('express loaded');

  const mongoose = require('mongoose');
  console.log('mongoose loaded');

  const cors = require('cors');
  console.log('cors loaded');

  const path = require('path');
  const fs = require('fs');
  console.log('core modules loaded');

  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('uploads dir ready');

  const authRoutes = require('./routes/auth');
  console.log('auth routes loaded');

  const receiptRoutes = require('./routes/receipts');
  console.log('receipt routes loaded');

  const aiRoutes = require('./routes/ai');
  console.log('ai routes loaded');

  const warrantyRoutes = require('./routes/warranties');
  console.log('warranty routes loaded');

  const analyticsRoutes = require('./routes/analytics');
  console.log('analytics routes loaded');

  const notificationRoutes = require('./routes/notifications');
  console.log('notification routes loaded');

  const app = express();
  const PORT = process.env.PORT || 5000;
  console.log('express app created');

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  const rateLimit = require('express-rate-limit');
  app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
  app.use('/api/ai/', rateLimit({ windowMs: 60 * 1000, max: 10 }));

  app.use('/api/auth', authRoutes);
  app.use('/api/receipts', receiptRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/warranties', warrantyRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  console.log('routes mounted');

  const clientDist = path.join(__dirname, '../client/dist');
  console.log('Looking for client dist at:', clientDist);
  console.log('Client dist exists:', fs.existsSync(clientDist));

  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
    console.log('serving client from dist');
  }

  console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);

  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => console.log('Server running on port ' + PORT));
    })
    .catch(err => {
      console.error('MONGODB ERROR:', err.message);
      process.exit(1);
    });

} catch (err) {
  console.error('FATAL STARTUP ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
}
