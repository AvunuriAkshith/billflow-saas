# 🚀 BillFlow — Subscription SaaS Billing Platform

>Full-stack SaaS subscription billing platform with Razorpay payments, JWT authentication, PDF invoices, email notifications, subscription management, billing history, and admin analytics.

---

# 🌐 Live Demo

## 🔗 Frontend
```text
https://billflow-saas-ecru.vercel.app/
```

## 🔗 Backend API
```text
https://billflow-saas-rm1h.onrender.com/api
```

---
# 📌 About BillFlow

**BillFlow** is a full-stack SaaS subscription billing platform designed to manage the complete customer billing lifecycle in one application.

The platform combines authentication, subscription management, Razorpay payments, secure payment verification, billing history, PDF invoice generation, transactional emails, in-app notifications, password reset, and admin analytics.

---

# 🎯 Problem Statement

Subscription-based applications need to handle multiple workflows such as user authentication, subscription management, payment processing, billing records, invoice generation, notifications, and administrative analytics.

Managing these workflows separately can make a SaaS application complex to maintain.

**BillFlow** brings these core billing workflows together into a single full-stack platform, providing users with a centralized way to manage subscriptions, payments, invoices, and billing activity.

---

# 💡 Solution

BillFlow provides an end-to-end subscription billing workflow:

```text
User
 ↓
Create Account
 ↓
Login
 ↓
Choose Subscription Plan
 ↓
Razorpay Checkout
 ↓
Payment Verification
 ↓
Subscription Activation
 ↓
Invoice Generation
 ↓
Email Notification
 ↓
In-App Notification
 ↓
Billing History
```
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

## 🧾 Invoice Management

BillFlow automatically generates professional PDF invoices after successful payments.

### Invoice Includes

- Customer information
- Subscription plan
- Payment amount
- Currency
- Payment ID
- Razorpay Order ID
- Payment date
- Subscription start date
- Subscription end date

Users can download invoices directly from the Billing History section.

---

## 📧 Transactional Email System

BillFlow integrates **Resend** for transactional email delivery.

### Email Workflows

- ✅ Payment Successful
- ❌ Payment Failed
- 🧾 Invoice Generated
- 🔄 Subscription Cancelled
- ⏰ Subscription Expired
- 🔑 Password Reset

The generated invoice can also be sent as an email attachment.

> **Development Note:** The current Resend testing sender has recipient restrictions. Production email delivery to arbitrary users requires a verified sending domain.

---

## 🔔 Notification Center

BillFlow includes an in-app notification system for important account and billing events.

### Users Can

- View notifications
- Mark individual notifications as read
- Mark all notifications as read
- Delete notifications

### Notification Types

```text
Payment Success
Payment Failed
Invoice Generated
Subscription Activated
Subscription Cancelled
Subscription Expiring
Subscription Expired
Password Reset
System Notification
```
---
# 💰 Razorpay Payment Integration

BillFlow uses **Razorpay** for payment processing.

## 🔄 Payment Flow

```text
Select Subscription Plan
          ↓
Create Razorpay Order
          ↓
Open Razorpay Checkout
          ↓
Complete Payment
          ↓
Receive Payment ID + Order ID + Signature
          ↓
Backend Payment Verification
          ↓
HMAC SHA256 Signature Verification
          ↓
Store Payment in MongoDB
          ↓
Activate Subscription
          ↓
Generate PDF Invoice
          ↓
Send Email Notification
          ↓
Create In-App Notification
```
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
Pydantic
JWT Authentication
Passlib / Bcrypt
Razorpay API
ReportLab
Resend
```

## ☁️ Deployment
```text
Frontend  → Vercel
Backend   → Render
Database  → MongoDB Atlas
Payments  → Razorpay
Email     → Resend
```
# 🧠 System Architecture

```text
                     ┌─────────────────────┐
                     │      React.js       │
                     │   Vite + Tailwind   │
                     │      Frontend       │
                     └──────────┬──────────┘
                                │
                                │ REST API
                                ▼
                     ┌─────────────────────┐
                     │       FastAPI       │
                     │       Backend       │
                     └───────┬───────┬─────┘
                             │       │
                 ┌───────────┘       └────────────┐
                 ▼                                ▼
        ┌──────────────────┐             ┌──────────────────┐
        │   MongoDB Atlas  │             │     Razorpay     │
        │                  │             │ Payment Gateway  │
        │ Users            │             └──────────────────┘
        │ Payments         │
        │ Notifications    │
        └─────────┬────────┘
                  │
             ┌────┴─────┐
             ▼          ▼
       ┌──────────┐  ┌────────────┐
       │  Resend  │  │  ReportLab │
       │  Email   │  │ PDF Invoice│
       └──────────┘  └────────────┘
```
---

# 📸 Screenshots

## 🖥️ Dashboard
<img width="1919" height="1016" alt="image" src="https://github.com/user-attachments/assets/6a7c8931-9b93-4198-b048-487394a819cd" />


## 📈 Admin Analytics
<img width="1919" height="1014" alt="image" src="https://github.com/user-attachments/assets/9739db8f-3492-45eb-9bd2-46080a0f1b9f" />
<img width="1919" height="1012" alt="image" src="https://github.com/user-attachments/assets/85a2a0ae-5257-45f4-885d-740ffa7e0acf" />



## 💳 Billing History
<img width="1919" height="1018" alt="image" src="https://github.com/user-attachments/assets/2eaddf61-f295-48a6-b845-205bf2dc6ea5" />



---

# ⚙️ Installation & Setup

# 1️⃣ Clone Repository

```bash
git clone https://github.com/AvunuriAkshith/billflow-saas.git

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

RESEND_API_KEY=your_resend_api_key

EMAIL_FROM=your_sender_email

FRONTEND_URL=http://localhost:5173
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
✔ Protected API Endpoints
✔ Admin Authorization
✔ Role-Based Access Control
✔ Password Hashing using Bcrypt
✔ Token-Based Password Reset
✔ Secure Razorpay Payment Verification
✔ HMAC SHA256 Signature Verification
✔ Environment Variable Secrets
✔ CORS Configuration
✔ Sensitive Credentials excluded from Git
```

---
# 📡 API Modules

BillFlow provides REST APIs for authentication, payments, subscriptions, notifications, and administration.

## 🔐 Authentication

```text
/register
/login
/password-reset
```

# 📈 Future Enhancements

- Real Recurring Razorpay Subscription Integration
- Automated Subscription Renewal
- Refund Management
- Coupon and Discount System
- Advanced Audit Logs
- Automated Unit and Integration Testing
- CI/CD Pipeline
- Advanced Monitoring and Logging
- Customer Management Portal
- Progressive Web App Support

---
# 💼 Resume Project Description

> **BillFlow — Full-Stack SaaS Subscription Billing Platform:** Built a full-stack SaaS billing platform using React, FastAPI, and MongoDB with Razorpay payment integration, JWT authentication, HMAC SHA256 payment verification, subscription lifecycle management, PDF invoice generation, transactional email notifications, billing history, in-app notifications, and admin analytics. Deployed the frontend on Vercel and backend on Render.

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
