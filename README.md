# 🚀 BillFlow — Full-Stack SaaS Subscription Billing Platform

> A modern full-stack SaaS billing platform for managing subscriptions, Razorpay payments, invoices, billing history, transactional emails, notifications, and admin analytics.

<p align="center">
  <a href="https://billflow-saas-ecru.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel" />
  </a>
  <a href="https://billflow-saas-rm1h.onrender.com/api">
    <img src="https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black" />
  </a>
  <a href="https://github.com/AvunuriAkshith/billflow-saas">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-3395FF?style=flat-square" />
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Resend-Email-000000?style=flat-square" />
</p>

---

# 🌐 Live Demo

### 🎨 Frontend

🔗 **https://billflow-saas-ecru.vercel.app/**

### ⚙️ Backend API

🔗 **https://billflow-saas-rm1h.onrender.com/api**

---

# 📌 About The Project

**BillFlow** is a full-stack SaaS subscription billing platform designed to simulate a production-style billing workflow for subscription-based applications.

The platform brings together customer authentication, subscription management, Razorpay payments, billing records, invoice generation, transactional emails, in-app notifications, and administrative analytics into one application.

### BillFlow provides:

- Secure user authentication
- Subscription plan management
- Razorpay payment processing
- Secure payment signature verification
- Subscription lifecycle management
- Billing history
- Professional PDF invoice generation
- Transactional email notifications
- In-app notification center
- Secure password reset workflow
- Admin analytics dashboard
- Responsive modern SaaS UI
- Production deployment using Vercel and Render

---

# 🎯 Problem Statement

Subscription-based applications require several independent systems to handle:

- Customer accounts
- Authentication
- Subscription plans
- Payment processing
- Billing records
- Invoice generation
- Payment notifications
- Administrative analytics

BillFlow combines these workflows into a single full-stack application, providing a centralized billing experience for both customers and administrators.

---

# ✨ Key Features

## 🔐 Authentication & Account Management

- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Role-Based Access Control
- Password Reset
- Secure token-based password reset workflow
- Password hashing using bcrypt
- Authentication state persistence

---

## 💳 Subscription Plans

BillFlow currently supports three subscription plans:

| Plan | Price | Duration |
|------|------:|---------:|
| 🆓 Free | ₹0 | Free |
| ⭐ Pro | ₹499 | 30 Days |
| 🚀 Enterprise | ₹1,999 | 30 Days |

Users can:

- View available subscription plans
- Select a plan
- Upgrade their subscription
- View current subscription
- Track subscription status
- View subscription start date
- View subscription expiry date

---

# 💰 Razorpay Payment Integration

BillFlow integrates **Razorpay** for secure payment processing.

### Payment Workflow

```text
User Selects Plan
        ↓
Create Razorpay Order
        ↓
Open Razorpay Checkout
        ↓
Complete Payment
        ↓
Receive Payment ID + Order ID + Signature
        ↓
Verify Signature on Backend
        ↓
Store Payment in MongoDB
        ↓
Activate Subscription
        ↓
Generate PDF Invoice
        ↓
Send Payment / Invoice Email
        ↓
Create In-App Notification
