const fs = require('fs');
const path = require('path');
const axios = require('axios');

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'openai';
    this.apiKey = process.env.AI_API_KEY;
  }

  async analyzeReceipt(imagePath) {
    try {
      if (this.provider === 'openai' && this.apiKey && this.apiKey !== 'your-api-key-here') {
        return await this.analyzeWithOpenAI(imagePath);
      }
      return await this.analyzeWithMock(imagePath);
    } catch (error) {
      console.error('AI analysis error:', error.message);
      return await this.analyzeWithMock(imagePath);
    }
  }

  async analyzeWithOpenAI(imagePath) {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: this.apiKey });

    let imageBuffer;
    if (imagePath.startsWith('http')) {
      const res = await axios.get(imagePath, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(res.data, 'binary');
    } else {
      imageBuffer = fs.readFileSync(imagePath);
    }
    
    const base64Image = imageBuffer.toString('base64');
    // For remote URLs without extension, fallback to jpeg.
    let ext = path.extname(imagePath.split('?')[0]).toLowerCase();
    if (!ext) ext = '.jpeg';
    const mimeType = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[ext] || 'image/jpeg';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a receipt analysis AI. Extract purchase information from the receipt image and return ONLY a valid JSON object with this exact schema:
{
  "storeName": "string",
  "purchaseDate": "YYYY-MM-DD",
  "receiptNumber": "string",
  "currency": "INR",
  "totalAmount": number,
  "paymentMethod": "string",
  "items": [
    {
      "name": "string",
      "category": "Electronics|Clothing|Food|Grocery|Furniture|Travel|Healthcare|Footwear|Other",
      "quantity": number,
      "unitPrice": number,
      "totalPrice": number,
      "warrantyPeriod": "string or null",
      "warrantyExpiry": "YYYY-MM-DD or null",
      "returnPeriod": "string or null",
      "returnDeadline": "YYYY-MM-DD or null"
    }
  ],
  "confidence": number between 0 and 1
}
Rules:
- Do NOT invent missing information. If warranty/return info is not on receipt, set to null.
- If a date cannot be determined, use null.
- Currency defaults to INR.
- Confidence reflects how clearly you could read the receipt.
- Return ONLY the JSON, no other text.`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this receipt and extract all purchase information.' },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.1
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('Invalid AI response format');
  }

  async analyzeWithMock(imagePath) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockReceipts = [
      {
        storeName: 'Nike Store',
        purchaseDate: '2026-08-10',
        receiptNumber: 'NK-2026-0810-001',
        currency: 'INR',
        totalAmount: 3499,
        paymentMethod: 'UPI',
        items: [{
          name: 'Running Shoes',
          category: 'Footwear',
          quantity: 1,
          unitPrice: 3499,
          totalPrice: 3499,
          warrantyPeriod: '1 year',
          warrantyExpiry: '2027-08-10',
          returnPeriod: '7 days',
          returnDeadline: '2026-08-17'
        }],
        confidence: 0.92
      },
      {
        storeName: 'Amazon',
        purchaseDate: '2026-07-28',
        receiptNumber: 'AMZ-2026-0728-042',
        currency: 'INR',
        totalAmount: 7999,
        paymentMethod: 'Credit Card',
        items: [{
          name: 'Sony WH-1000XM5 Headphones',
          category: 'Electronics',
          quantity: 1,
          unitPrice: 7999,
          totalPrice: 7999,
          warrantyPeriod: '1 year',
          warrantyExpiry: '2027-07-28',
          returnPeriod: '10 days',
          returnDeadline: '2026-08-07'
        }],
        confidence: 0.88
      },
      {
        storeName: 'Flipkart',
        purchaseDate: '2026-08-05',
        receiptNumber: 'FK-2026-0805-123',
        currency: 'INR',
        totalAmount: 2499,
        paymentMethod: 'UPI',
        items: [{
          name: 'Dell KB216 Keyboard',
          category: 'Electronics',
          quantity: 1,
          unitPrice: 2499,
          totalPrice: 2499,
          warrantyPeriod: '6 months',
          warrantyExpiry: '2027-02-05',
          returnPeriod: '7 days',
          returnDeadline: '2026-08-12'
        }],
        confidence: 0.85
      }
    ];
    return mockReceipts[Math.floor(Math.random() * mockReceipts.length)];
  }

  async chat(userMessage, purchaseContext) {
    try {
      if (this.provider === 'openai' && this.apiKey && this.apiKey !== 'your-api-key-here') {
        return await this.chatWithOpenAI(userMessage, purchaseContext);
      }
      return await this.chatWithMock(userMessage, purchaseContext);
    } catch (error) {
      console.error('AI chat error:', error.message);
      return await this.chatWithMock(userMessage, purchaseContext);
    }
  }

  async chatWithOpenAI(userMessage, purchaseContext) {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: this.apiKey });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a helpful purchase memory assistant. Answer questions about the user's purchase history based ONLY on the provided purchase data. Do not invent or assume purchases that are not in the data. If you cannot find relevant information, say "I couldn't find that information in your saved receipts."

Purchase Data:
${JSON.stringify(purchaseContext, null, 2)}`
        },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

    return response.choices[0].message.content;
  }

  async chatWithMock(userMessage, purchaseContext) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const lowerMsg = userMessage.toLowerCase();
    const receipts = purchaseContext;

    if (lowerMsg.includes('shoe') || lowerMsg.includes('footwear')) {
      const shoes = receipts.filter(r => r.items.some(i => i.category === 'Footwear'));
      if (shoes.length > 0) {
        const s = shoes[0];
        return `You purchased ${s.items[0].name} from ${s.storeName} on ${new Date(s.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} for ₹${s.totalAmount.toLocaleString('en-IN')}.`;
      }
    }

    if (lowerMsg.includes('expensive') || lowerMsg.includes('highest')) {
      const sorted = [...receipts].sort((a, b) => b.totalAmount - a.totalAmount);
      if (sorted.length > 0) {
        const s = sorted[0];
        return `Your most expensive purchase was ${s.items[0]?.name || 'item'} from ${s.storeName} for ₹${s.totalAmount.toLocaleString('en-IN')} on ${new Date(s.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`;
      }
    }

    if (lowerMsg.includes('warranty') && (lowerMsg.includes('expir') || lowerMsg.includes('soon'))) {
      const now = new Date();
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const expiring = [];
      receipts.forEach(r => r.items.forEach(i => {
        if (i.warrantyExpiry && new Date(i.warrantyExpiry) <= thirtyDays) {
          expiring.push({ name: i.name, expiry: i.warrantyExpiry, store: r.storeName });
        }
      }));
      if (expiring.length > 0) {
        return expiring.map(e => `⚠️ ${e.name} warranty expires on ${new Date(e.expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`).join('\n');
      }
      return 'No warranties are expiring within the next 30 days.';
    }

    if (lowerMsg.includes('warranty') && lowerMsg.includes('active')) {
      const now = new Date();
      const active = [];
      receipts.forEach(r => r.items.forEach(i => {
        if (i.warrantyExpiry && new Date(i.warrantyExpiry) > now) {
          active.push({ name: i.name, expiry: i.warrantyExpiry });
        }
      }));
      if (active.length > 0) {
        return `You have ${active.length} item(s) under active warranty:\n` + active.map(a => `• ${a.name} — expires ${new Date(a.expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`).join('\n');
      }
    }

    if (lowerMsg.includes('amazon') || lowerMsg.includes('flipkart') || lowerMsg.includes('store')) {
      const storeMatch = receipts.filter(r => lowerMsg.includes(r.storeName.toLowerCase()));
      if (storeMatch.length > 0) {
        return storeMatch.map(r => `• ${r.items[0]?.name || 'item'} — ₹${r.totalAmount.toLocaleString('en-IN')} on ${new Date(r.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`).join('\n');
      }
    }

    if (lowerMsg.includes('total') && lowerMsg.includes('spend')) {
      const total = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
      return `You've spent a total of ₹${total.toLocaleString('en-IN')} across ${receipts.length} purchase(s).`;
    }

    if (lowerMsg.includes('how much') && lowerMsg.includes('pay')) {
      return receipts.map(r => `${r.items[0]?.name || 'item'}: ₹${r.totalAmount.toLocaleString('en-IN')}`).join('\n');
    }

    if (lowerMsg.includes('when') && lowerMsg.includes('buy')) {
      return receipts.map(r => `${r.items[0]?.name || 'item'}: purchased on ${new Date(r.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`).join('\n');
    }

    if (receipts.length === 0) {
      return "I couldn't find that information in your saved receipts.";
    }

    return `Based on your ${receipts.length} saved purchase(s):\n` + receipts.map(r => `• ${r.items[0]?.name || 'Unknown item'} from ${r.storeName} — ₹${r.totalAmount.toLocaleString('en-IN')}`).join('\n');
  }
}

module.exports = new AIService();
