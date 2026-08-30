# AI Receipt Memory

An AI-powered full-stack web application that transforms receipt photos into intelligent purchase memories. Upload receipts, extract purchase data with AI, track warranties, and ask natural-language questions about your spending.

## Features

- **AI Receipt Analysis** - Upload a photo and AI extracts store, items, price, warranty, and more
- **Smart Purchase Memory** - All receipt data stored as structured, searchable records
- **Natural Language Chat** - Ask questions like "When did I buy shoes?" and get grounded answers
- **Warranty Tracker** - Track active warranties, expiry dates, and return deadlines
- **Spending Analytics** - Pie charts, bar charts, and store-level spending breakdowns
- **Purchase History** - Full-text search, filters by category/store/date/price, pagination
- **Notifications** - Alerts for expiring warranties and approaching return deadlines
- **Authentication** - JWT-based auth with registration, login, profile management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Recharts |
| Backend | Node.js, Express.js, Mongoose |
| Database | MongoDB |
| AI | OpenAI GPT-4o (with mock provider fallback) |
| Auth | JWT + bcrypt |

## Architecture

```
Receipt Image → Vision AI → Structured JSON → Validation → User Confirmation → MongoDB

User Question → Query Understanding → Retrieve Purchases → AI Context → LLM → Answer
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key (optional - mock mode works without it)

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Setup Environment

```bash
cp .env.example server/.env
# Edit server/.env with your MongoDB URI and API key
```

### 3. Seed Demo Data (Optional)

```bash
npm run seed
```

This creates a demo user: `demo@receipt.com` / `password123`

### 4. Run Development

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/ai-receipt-memory |
| `JWT_SECRET` | Secret for JWT signing | - |
| `AI_API_KEY` | OpenAI API key | - |
| `AI_PROVIDER` | AI provider (`openai` or `mock`) | openai |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:5173 |

> **Note:** If `AI_API_KEY` is not set, the app automatically uses a mock AI provider for development/testing.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Receipts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/receipts/upload` | Upload receipt image |
| GET | `/api/receipts` | List receipts (with search/filter/pagination) |
| GET | `/api/receipts/:id` | Get receipt details |
| PUT | `/api/receipts/:id` | Update receipt |
| PUT | `/api/receipts/:id/confirm` | Confirm & save analyzed receipt |
| DELETE | `/api/receipts/:id` | Delete receipt |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/analyze-receipt` | Analyze receipt image with AI |
| POST | `/api/ai/chat` | Ask question about purchases |

### Warranties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/warranties` | Get all warranty info |
| GET | `/api/warranties/expiring` | Get expiring warranties |
| GET | `/api/warranties/returns` | Get return period info |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | Dashboard summary stats |
| GET | `/api/analytics/monthly` | Monthly spending data |
| GET | `/api/analytics/categories` | Spending by category |
| GET | `/api/analytics/stores` | Spending by store |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PUT | `/api/notifications/read` | Mark all as read |
| POST | `/api/notifications/generate` | Generate warranty alerts |

## Database Structure

### User
- `name`, `email`, `password` (hashed), `createdAt`, `updatedAt`

### Receipt
- `userId`, `imageUrl`, `storeName`, `purchaseDate`, `receiptNumber`, `totalAmount`, `currency`, `paymentMethod`, `items[]`, `confidence`, `status`

### Item (embedded in Receipt)
- `name`, `category`, `quantity`, `unitPrice`, `totalPrice`, `warrantyPeriod`, `warrantyExpiry`, `returnPeriod`, `returnDeadline`

### Notification
- `userId`, `type`, `title`, `message`, `relatedPurchaseId`, `isRead`, `createdAt`

## Example AI Queries

```
When did I buy my shoes?
What was my most expensive purchase?
Show my electronics purchases
How much did I spend on clothing this year?
Which warranties expire this month?
Find purchases from Amazon
Which products are still under warranty?
How much have I spent total?
```

## Project Structure

```
ai-receipt-memory/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── context/           # React contexts
│   │   └── App.jsx
│   └── package.json
├── server/                    # Express backend
│   ├── controllers/
│   ├── models/                # Mongoose models
│   ├── routes/                # API routes
│   ├── middleware/             # Auth, validation
│   ├── services/              # AI, memory, receipt services
│   ├── utils/                 # Seed script
│   ├── uploads/               # Uploaded receipts
│   ├── server.js
│   └── package.json
├── .env.example
├── package.json
└── README.md
```

## Future Enhancements

- Email notifications for warranty expiries
- Vector database for semantic receipt search
- OCR fallback using Tesseract
- Multi-language receipt support
- Receipt sharing between users
- Export purchase data to CSV/PDF
- Recurring purchase detection
- Price comparison across stores
