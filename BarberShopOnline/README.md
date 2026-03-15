# 💈 BarberOS — Smart Barber Shop Management System

A full-stack, production-ready web application that helps barber shop owners
digitise their entire operation — customer records, online bookings, revenue
tracking, transaction ledger, service reminders, and WhatsApp notifications.

---

## ✨ Features

| Module | What it does |
|---|---|
| **Customer Management** | Add / edit / delete customers, view full visit history and spend |
| **Slot Booking System** | Customers book online; owners confirm, complete, or cancel |
| **Revenue Dashboard** | Live KPIs, 14-day area chart, payment method pie chart |
| **Transaction Ledger** | Log every service with price & payment mode; filter & export |
| **Analytics** | 7 / 14 / 30 / 90-day charts, top services, peak day revenue |
| **Service Reminders** | List customers overdue for a visit; simulate WhatsApp / SMS |
| **Services Setup** | Add your menu: name, price, duration, category, active toggle |
| **Public Booking Page** | `/book/:ownerId` — shareable link for customers |
| **Auth** | JWT-based register / login; owner-scoped data |

---

## 🗂 Folder Structure

```
barbershop/
├── package.json              ← root monorepo scripts
│
├── server/                   ← Node.js + Express + MongoDB
│   ├── index.js              ← app entry point
│   ├── seed.js               ← demo data seeder
│   ├── .env.example
│   ├── vercel.json
│   ├── models/
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Booking.js
│   │   ├── Transaction.js
│   │   └── Service.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── customers.js
│   │   ├── transactions.js
│   │   ├── services.js
│   │   ├── dashboard.js
│   │   └── reminders.js
│   └── middleware/
│       └── auth.js           ← JWT protect middleware
│
└── client/                   ← React 18 + Vite + Tailwind CSS
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── vercel.json
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx            ← all routes
        ├── index.css          ← Tailwind + custom utilities
        ├── utils/
        │   └── api.js         ← Axios instance with JWT interceptor
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── DashboardLayout.jsx   ← sidebar + topbar shell
        │   └── ui/
        │       ├── Modal.jsx
        │       ├── StatCard.jsx
        │       ├── Table.jsx
        │       └── EmptyState.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── BookingPage.jsx       ← public booking (multi-step)
            ├── DashboardHome.jsx     ← overview + charts
            ├── CustomersPage.jsx
            ├── BookingsPage.jsx
            ├── TransactionsPage.jsx
            ├── ServicesPage.jsx
            ├── AnalyticsPage.jsx
            └── RemindersPage.jsx
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB (local) **or** a free [MongoDB Atlas](https://cloud.mongodb.com) cluster
- npm

### 1 — Clone & Install

```bash
# Install all deps (root, server, and client)
npm run install:all
```

### 2 — Configure Environment

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env:
#   MONGODB_URI=mongodb+srv://...   ← your Atlas URI or mongodb://localhost:27017/barbershop
#   JWT_SECRET=any_long_random_string
#   CLIENT_URL=http://localhost:5173

# Client (optional — proxy is pre-configured for development)
cp client/.env.example client/.env.local
```

### 3 — Seed Demo Data

```bash
npm run seed
# Creates: demo@barbershop.com / demo123
# Seeds:   8 services, 10 customers, ~200 transactions, 8 bookings
```

### 4 — Start Dev Servers

```bash
# Run both server (port 5000) + client (port 5173) together
npm run dev

# Or individually:
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

Open **http://localhost:5173** and sign in with `demo@barbershop.com` / `demo123`.

---

## ☁️ Deploy on Vercel

### Deploy the API (server)

1. Push the `server/` folder to a GitHub repo (or use the full monorepo).
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Set **Root Directory** to `server`.
4. Add Environment Variables in Vercel project settings:
   ```
   MONGODB_URI     = mongodb+srv://...
   JWT_SECRET      = your_secret_key
   NODE_ENV        = production
   CLIENT_URL      = https://your-client.vercel.app
   ```
5. Deploy. Note your API URL, e.g. `https://barberos-api.vercel.app`.

### Deploy the Client (client)

1. Go to Vercel → **New Project** → same repo.
2. Set **Root Directory** to `client`.
3. Add Environment Variable:
   ```
   VITE_API_URL = https://barberos-api.vercel.app/api
   ```
4. Deploy. Your app is live! 🎉

> **Tip:** Update `server/.env` `CLIENT_URL` to your client Vercel URL to fix CORS.

---

## 🔌 API Reference

All protected endpoints require `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create shop account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET  | `/api/auth/me` | Get current user |
| PUT  | `/api/auth/profile` | Update profile |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/customers?search=` | List + search |
| POST   | `/api/customers` | Create customer |
| PUT    | `/api/customers/:id` | Update |
| POST   | `/api/customers/:id/visits` | Add visit record |
| DELETE | `/api/customers/:id` | Delete |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/bookings/slots?date=&ownerId=` | **Public** available slots |
| GET    | `/api/bookings/services-public?ownerId=` | **Public** service list |
| POST   | `/api/bookings/public` | **Public** submit booking |
| GET    | `/api/bookings?status=&date=` | List bookings |
| POST   | `/api/bookings` | Owner create booking |
| PATCH  | `/api/bookings/:id/status` | Update status |
| DELETE | `/api/bookings/:id` | Delete |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/transactions?search=&method=&startDate=&endDate=` | List + filter |
| POST   | `/api/transactions` | Log transaction |
| DELETE | `/api/transactions/:id` | Delete |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | KPI overview |
| GET | `/api/dashboard/revenue-chart?days=` | Daily revenue array |
| GET | `/api/dashboard/payment-breakdown` | Payment method totals |
| GET | `/api/dashboard/top-services` | Top 6 services by revenue |

### Reminders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/reminders?days=` | Customers overdue by N days |
| POST | `/api/reminders/simulate` | Simulate sending a notification |

---

## 📱 Integrating Real WhatsApp / SMS

Replace the simulated reminder logic in `server/routes/reminders.js`:

```javascript
// Install: npm install twilio
const twilio = require("twilio");
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// WhatsApp (Twilio Sandbox)
await client.messages.create({
  from: "whatsapp:+14155238886",   // Twilio sandbox number
  to:   `whatsapp:+91${customer.phone}`,
  body: message,
});

// SMS
await client.messages.create({
  from: process.env.TWILIO_PHONE,
  to:   `+91${customer.phone}`,
  body: message,
});
```

Add to `server/.env`:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE=+1xxxxxxxxxx
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Tailwind CSS v3, custom CSS utilities |
| Charts | Recharts (AreaChart, BarChart, PieChart) |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| HTTP Client | Axios with interceptors |
| Notifications | react-hot-toast |
| Icons | Lucide React |
| Deploy | Vercel (client + server) |

---

## 🧑‍💻 Demo Credentials

After running `npm run seed`:

```
Email:    demo@barbershop.com
Password: demo123
Shop:     The Cut Lab
```

Public booking page: `http://localhost:5173/book/<your-user-id>`
(Your user ID is shown on the dashboard Overview page.)

---

## 📄 License

MIT — free to use, modify, and deploy for your own barbershop or as a coding project.

---

*Built for CampusDailyPulse Coding Challenge #001 🏆*
