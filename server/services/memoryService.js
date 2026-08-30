const Receipt = require('../models/Receipt');

class MemoryService {
  async searchRelevantPurchases(userId, query) {
    const lowerQuery = query.toLowerCase();
    const receipts = await Receipt.find({ userId, status: 'confirmed' }).sort({ purchaseDate: -1 }).limit(100);

    const scored = receipts.map(receipt => {
      let score = 0;
      const searchableText = [
        receipt.storeName,
        receipt.receiptNumber,
        receipt.paymentMethod,
        ...receipt.items.map(i => `${i.name} ${i.category} ${i.warrantyPeriod}`)
      ].join(' ').toLowerCase();

      const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
      queryWords.forEach(word => {
        if (searchableText.includes(word)) score += 10;
        if (receipt.storeName.toLowerCase().includes(word)) score += 15;
        if (receipt.items.some(i => i.name.toLowerCase().includes(word))) score += 20;
        if (receipt.items.some(i => i.category.toLowerCase().includes(word))) score += 12;
      });

      if (lowerQuery.includes('warranty')) {
        const now = new Date();
        receipt.items.forEach(item => {
          if (item.warrantyExpiry && new Date(item.warrantyExpiry) > now) score += 5;
        });
      }

      if (lowerQuery.includes('recent') || lowerQuery.includes('latest')) {
        const daysDiff = (Date.now() - new Date(receipt.purchaseDate).getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff < 30) score += 20;
        else if (daysDiff < 90) score += 10;
      }

      return { receipt, score };
    });

    return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).map(s => s.receipt);
  }

  async getWarrantyInfo(userId) {
    const receipts = await Receipt.find({ userId, status: 'confirmed' });
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const warranties = [];

    receipts.forEach(receipt => {
      receipt.items.forEach(item => {
        if (item.warrantyExpiry) {
          const expiry = new Date(item.warrantyExpiry);
          let status = 'expired';
          if (expiry > now) status = 'active';
          if (expiry <= thirtyDays && expiry > now) status = 'expiring_soon';

          warranties.push({
            receiptId: receipt._id,
            productName: item.name,
            storeName: receipt.storeName,
            purchaseDate: receipt.purchaseDate,
            warrantyPeriod: item.warrantyPeriod,
            warrantyExpiry: item.warrantyExpiry,
            daysRemaining: Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))),
            status
          });
        }
      });
    });

    return warranties.sort((a, b) => new Date(a.warrantyExpiry) - new Date(b.warrantyExpiry));
  }

  async getReturnInfo(userId) {
    const receipts = await Receipt.find({ userId, status: 'confirmed' });
    const now = new Date();
    const returns = [];

    receipts.forEach(receipt => {
      receipt.items.forEach(item => {
        if (item.returnDeadline) {
          const deadline = new Date(item.returnDeadline);
          let status = 'expired';
          if (deadline > now) status = 'active';
          if (deadline <= new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) && deadline > now) status = 'urgent';

          returns.push({
            receiptId: receipt._id,
            productName: item.name,
            storeName: receipt.storeName,
            purchaseDate: receipt.purchaseDate,
            returnPeriod: item.returnPeriod,
            returnDeadline: item.returnDeadline,
            daysRemaining: Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))),
            status
          });
        }
      });
    });

    return returns.sort((a, b) => new Date(a.returnDeadline) - new Date(b.returnDeadline));
  }
}

module.exports = new MemoryService();
