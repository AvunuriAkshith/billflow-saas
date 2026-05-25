# 🚀 BillFlow — Subscription SaaS Billing Platform

>BillFlow is a modern full-stack SaaS Billing & Subscription Management Platform built using React, FastAPI, MongoDB, and Razorpay. It enables users to purchase subscription plans, manage invoices, track billing history, and provides an interactive admin analytics dashboard.

---

# 🌐 Live Demo

## 🔗 Frontend
```text
https://billflow-saas-ecru.vercel.app/
```

## 🔗 Backend API
```text
ttps://billflow-saas-rm1h.onrender.com/api
```

---

# ✨ Features

## 🔐 Authentication System
- User Registration
- User Login
- JWT Authentication
- Forgot Password
- Protected Routes
- Role-Based Access Control

---

## 💳 Subscription & Billing
- Free / Pro / Enterprise Plans
- Razorpay Payment Integration
- Secure Payment Verification
- Billing History
- Invoice Generation & Download

---

## 📊 User Dashboard
- Current Subscription Plan
- Billing History
- Upgrade Plan
- Dark / Light Mode
- Modern SaaS UI

---

## 🛠️ Admin Dashboard
- Total Revenue Analytics
- Total Users Tracking
- Active Paid Users
- Interactive Analytics Cards
- Revenue Charts using Recharts
- System Health Monitoring

---

# 🧠 Tech Stack

## 🎨 Frontend
```text
React.js
Vite
Tailwind CSS
Recharts
Axios
React Router DOM
```

## ⚙️ Backend
```text
FastAPI
MongoDB Atlas
PyMongo
JWT Authentication
Razorpay API
ReportLab
```

## ☁️ Deployment
```text
Frontend  → Vercel
Backend   → Render
Database  → MongoDB Atlas
```

---

# 📸 Screenshots

## 🖥️ Dashboard
- SaaS-style modern UI
- Interactive cards
- Dark mode support

## 📈 Admin Analytics
- Revenue charts
- User analytics
- Subscription tracking

## 💳 Billing History
- Invoice downloads
- Payment tracking
- Transaction analytics

---

# ⚙️ Installation & Setup

# 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/billflow-saas.git

cd billflow-saas
```

---

# 🚀 Frontend Setup

```bash
cd client

npm install

npm run dev
```

## Frontend Runs On
```text
http://localhost:5173
```

---

# 🚀 Backend Setup

```bash
cd server

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

## Backend Runs On
```text
http://127.0.0.1:8000
```

---

# 🔑 Environment Variables

Create `.env` inside `server`

```env
MONGO_URI=your_mongodb_atlas_url

JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=your_razorpay_key

RAZORPAY_KEY_SECRET=your_razorpay_secret
```

---

# 💳 Razorpay Test Payment

## 🧪 Test Card

```text
Card Number : 4111 1111 1111 1111
Expiry Date : Any Future Date
CVV         : Any 3 Digits
OTP         : 1234
```

---

# 📂 Project Structure

```text
billflow-saas/
│
├── client/
│   ├── src/
│   ├── pages/
│   ├── components/
│   ├── routes/
│   └── services/
│
├── server/
│   ├── app/
│   ├── routes/
│   ├── models/
│   ├── database/
│   └── utils/
│
└── README.md
```

---

# 🔒 Security Features

```text
✔ JWT Authentication
✔ Protected Routes
✔ Admin Authorization
✔ Password Hashing using Bcrypt
✔ Secure Razorpay Payment Verification
```

---

# 📈 Future Enhancements

- Email OTP Verification
- Stripe Integration
- Subscription Expiry Reminders
- Multi-Tenant SaaS Support
- AI-Based Revenue Analytics
- Team Management System

---

# 👨‍💻 Author

## Akshith Avunuri

### 🌐 GitHub
```text
https://github.com/AvunuriAkshith
```

### 💼 LinkedIn
```text
https://www.linkedin.com/in/avunuriakshith
```

---

# ⭐ Support

If you like this project, give it a ⭐ on GitHub and support the project 🚀
