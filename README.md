# 🏦 HyperOne

### AI-Enhanced Digital Banking Platform

---

## 📌 Problem Statement

Modern banking platforms still suffer from major challenges:

| Problem                                                                     | Impact                  |
| --------------------------------------------------------------------------- | ----------------------- |
| Banks provide a generic experience to all customers                         | Low customer engagement |
| KYC and onboarding processes are lengthy and inconvenient                   | High drop-off rates     |
| Customers struggle to understand investments, loans, and financial products | Low digital adoption    |

**HyperOne solves these challenges by combining intelligent onboarding, AI-assisted banking, personalised dashboards, and financial insights into a unified digital banking platform.**

---

# 🎯 Hackathon Pillars Coverage

| Pillar                 | HyperOne Solution                                             | Impact               |
| ---------------------- | ------------------------------------------------------------- | -------------------- |
| ✅ Customer Acquisition | Seamless digital onboarding with OCR-assisted KYC             | Faster onboarding    |
| ✅ Digital Adoption     | Personalised customer dashboard with AI assistance            | Increased engagement |
| ✅ Digital Engagement   | Financial health insights, recommendations, and notifications | Higher retention     |

---

# 🚀 What is HyperOne?

HyperOne is an AI-enhanced digital banking platform designed for the SBI Hackathon 2026.

Unlike chatbot-first banking applications, HyperOne places the **Customer Dashboard at the centre of the experience**, while AI acts as an optional Banking Copilot.

Customers can:

* Complete digital onboarding
* Upload PAN & Aadhaar for AI-assisted KYC
* View portfolio and banking information
* Track financial health
* Set financial goals
* Access personalized recommendations
* Interact with an AI Banking Copilot

---

# ✨ Key Features

## 👤 Digital Customer Onboarding

* Multi-step onboarding flow
* Customer profile creation
* PAN & Aadhaar upload
* OCR-based document extraction
* AI-assisted verification
* Account creation workflow

---

## 🪪 AI-Assisted KYC

Upload PAN and Aadhaar documents.

HyperOne automatically:

* Extracts customer details using OCR
* Detects inconsistencies
* Auto-fills profile information
* Validates KYC information

---

## 📊 Customer Dashboard

Premium HDFC Securities-inspired dashboard featuring:

### Portfolio Overview

* Total Portfolio Value
* Today's Gain/Loss
* Overall Returns
* Invested Amount

### Banking Summary

* Account Balance
* Active Loans
* Insurance Status
* Available Credit

### Investments

* SIPs
* Mutual Funds
* Fixed Deposits

### Financial Health

* Financial Health Score (0–100)
* Savings analysis
* Goal tracking
* Personalized insights

---

## 💬 HyperOne AI Copilot

AI is an enhancement layer, not the primary experience.

The AI Banking Copilot helps customers:

* Understand transactions
* Get investment suggestions
* Receive loan guidance
* Understand portfolio performance
* Discover suitable banking products

Example queries:

```text
How much have I invested this month?

Show my portfolio performance.

Am I eligible for a home loan?

Suggest investments based on my profile.

Explain my recent transactions.
```

---

## 🔔 Smart Notifications

Customers receive notifications for:

* KYC updates
* SIP reminders
* Portfolio alerts
* Product recommendations
* EMI reminders

---

## 🎯 Goals & Planning

Customers can create financial goals:

* Home Purchase
* Retirement
* Education Fund
* Emergency Fund

Track progress using interactive visualisations.

---

## 📂 Document Vault

Securely manage:

* PAN Card
* Aadhaar Card

Features:

* View
* Preview
* Replace
* Download

---

## 🏛️ Admin Dashboard

Bank administrators can monitor:

* Customer acquisition
* KYC status
* Customer demographics
* Risk profile distribution
* Onboarding analytics

### Admin Capabilities

* View customer details
* Review uploaded documents
* Search customers
* Filter customers
* Review KYC status

---

# 🧠 System Architecture

```text
Customer
   │
   ▼
Digital Onboarding
   │
   ▼
OCR + KYC Verification
   │
   ▼
MongoDB Customer Record
   │
   ▼
Customer Dashboard
   │
   ├── Portfolio Analytics
   ├── Financial Health
   ├── Notifications
   ├── Goals & Planning
   └── AI Banking Copilot

Admin Dashboard
   │
   └── Customer Analytics & Management
```

---

# 🛠️ Tech Stack

## Frontend

* React 18
* Vite
* Tailwind CSS
* Framer Motion
* Recharts
* Zustand

## Backend

* Node.js
* Express.js
* MongoDB
* JWT Authentication

## AI Layer

* Google Gemini API
* Personalised Recommendation Engine

## Additional Libraries

* Tesseract.js
* Multer
* Axios

---

# 📁 Project Structure

```text
hyperone/
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── store/
│   │   └── services/
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│
├── package.json
└── README.md
```

---

# 🚀 Installation & Setup

## Prerequisites

* Node.js 18+
* MongoDB Atlas
* Google Gemini API Key

---

## Clone Repository

```bash
git clone https://github.com/bhavayvasudev/SBI-Hackathon.git

cd SBI-Hackathon
```

---

## Install Dependencies

### Root

```bash
npm install
```

### Client

```bash
cd client
npm install
```

### Server

```bash
cd ../server
npm install
```

---

## Environment Variables

Create:

```text
server/.env
```

```env
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

## Run Application

### Backend

```bash
cd server
npm run dev
```

### Frontend

```bash
cd client
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 📈 Future Roadmap

### Phase 1

* Voice Banking
* OCR-Based PAN & Aadhar Recognition
* Hindi Language Support
* Advanced Personalization

### Phase 2

* Real SBI API Integration
* WhatsApp Banking
* Investment Marketplace

### Phase 3

* YONO Integration
* Predictive Financial Planning
* Production Deployment

---

# 👨‍💻 Developed By

### Bhavay Vasudev

B.Tech ECE

Full Stack Developer | AI Enthusiast

GitHub: https://github.com/bhavayvasudev

LinkedIn: https://www.linkedin.com/in/bhavayvasudev/

---

## 📄 License

MIT License

---

### Built with ❤️ for SBI Hackathon 2026

### State Bank of India · Digital Innovation Division
