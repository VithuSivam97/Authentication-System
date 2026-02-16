# 🔐 Authentication System

A full-stack authentication system with a **hacker/terminal-themed UI**, built with React and Node.js. Features include user registration with OTP email verification, secure login, password recovery, and a Matrix-style animated dashboard.

![MIT License](https://img.shields.io/badge/License-MIT-green.svg)

---

## ✨ Features

- **User Registration** — Sign up with username, email, and access code (password)
- **OTP Email Verification** — 6-digit OTP sent via email during registration
- **Secure Login** — JWT-based authentication
- **Forgot Access Code** — Password reset flow with OTP verification and countdown timer
- **Dashboard** — Matrix rain animation, boot sequence, interactive terminal, network logs, and system stats
- **Terminal-Themed UI** — CRT scanlines, glitch effects, and neon-green-on-black aesthetic throughout

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 7 | Build tool & dev server |
| Tailwind CSS 4 | Styling |
| React Router 7 | Client-side routing |
| Axios | HTTP client |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication tokens |
| Bcrypt.js | Password hashing |
| Nodemailer | Email OTP delivery |
| Express Validator | Input validation |

---

## 📁 Project Structure

```
Authentication System/
├── FrontEnd/
│   └── src/
│       ├── components/
│       │   ├── TerminalLayout.jsx    # Shared terminal-style page wrapper
│       │   └── ErrorPopup.jsx        # Animated error popup modal
│       ├── pages/
│       │   ├── Login.jsx             # Login page
│       │   ├── Register.jsx          # Registration with OTP verification
│       │   ├── ForgotAccessCode.jsx  # Password reset flow
│       │   └── Dashboard.jsx         # Main dashboard with Matrix effects
│       ├── App.jsx                   # Routes & app entry
│       └── index.css                 # All custom styles & Tailwind config
├── Backend/
│   ├── controllers/
│   │   └── authController.js         # Auth logic (register, login, OTP, reset)
│   ├── middleware/
│   │   └── auth.js                   # JWT authentication middleware
│   ├── models/
│   │   ├── User.js                   # User schema
│   │   └── Otp.js                    # OTP schema
│   ├── routes/
│   │   └── auth.js                   # API route definitions
│   ├── utils/
│   │   ├── generateOtp.js            # OTP generation utility
│   │   └── sendEmail.js              # Email sending utility
│   └── server.js                     # Express server entry point
└── LICENSE
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas cloud)
- **Gmail account** (for sending OTP emails)

### 1. Clone the repository

```bash
git clone [https://github.com/VithuSivam97/Authentication-System.git](https://github.com/VithuSivam97/Authentication-System.git)
cd Authentication-System
```

### 2. Setup Backend

```bash
cd Backend
npm install
```

Create a [.env](cci:7://file:///c:/Users/vithu/OneDrive%20-%20University%20of%20Kelaniya/Projects/Authentication%20System/Backend/.env:0:0-0:0) file in the `Backend/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

> **Note:** For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

Start the backend server:

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd FrontEnd
npm install
npm run dev
```

The app will be running at `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/verify-otp` | Verify OTP during registration |
| `POST` | `/api/auth/login` | Login with credentials |
| `POST` | `/api/auth/forgot-access-code` | Request password reset OTP |
| `POST` | `/api/auth/reset-access-code` | Reset password with OTP |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**VithuSivam97**

---
