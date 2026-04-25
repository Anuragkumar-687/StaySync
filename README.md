# 🏠 StaySync - Smart Hostel & PG Management System

StaySync is a professional, full-stack SaaS application designed to streamline hostel and PG operations. It provides a seamless experience for both administrators and students, featuring AI-powered complaint routing, real-time room management, and secure payment tracking.

![StaySync Preview](https://via.placeholder.com/1200x600/060b18/ffffff?text=StaySync+Management+System)

## 🚀 Key Features

### 👨‍💼 For Administrators
- **Dynamic Dashboard:** Real-time stats on rooms, students, and revenue.
- **Room Management:** Create, update, and monitor room occupancy status.
- **Student Allocation:** Effortlessly assign students to rooms with automatic ledger creation.
- **AI-Categorized Complaints:** View and resolve student issues categorized automatically by our NLP classifier.
- **Payment Ledger:** Track rent payments and update statuses.
- **Broadcast System:** Send global announcements to all student dashboards.

### 🎓 For Students
- **Personalized Dashboard:** Overview of room details, pending payments, and announcements.
- **Smart Complaints:** Submit maintenance requests that are automatically routed to the right department.
- **Digital Gate Pass:** QR-based verification system for leaves and outings.
- **Payment History:** Keep track of rent dues and transaction history.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Context API
- **Animations:** CSS Keyframes & Transitions

### Backend
- **Environment:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Caching:** [Redis](https://redis.io/) (via Upstash/Redis Cloud)
- **Authentication:** JWT with HttpOnly cookies/headers
- **Payment Gateway:** [Razorpay](https://razorpay.com/)

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance
- Redis instance (optional but recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/staysync.git
cd StaySync
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGO_URI, JWT_SECRET, and RAZORPAY keys in .env
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Ensure NEXT_PUBLIC_API_URL points to your backend (default: http://localhost:5000/api)
npm run dev
```

---

## 🌐 Deployment

### Backend (Render/Railway)
1. Set the root directory to `backend`.
2. Build Command: `npm install`.
3. Start Command: `node server.js`.
4. Add all environment variables from `.env.example`.

### Frontend (Vercel)
1. Connect your repository and select the `frontend` directory.
2. Framework Preset: `Next.js`.
3. Environment Variable: `NEXT_PUBLIC_API_URL` (pointing to your deployed backend).

---

## 🔒 Environment Variables

### Backend
- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for signing tokens
- `RAZORPAY_KEY_ID`: Razorpay API Key
- `RAZORPAY_KEY_SECRET`: Razorpay Secret Key
- `CLIENT_URL`: URL of your frontend (for CORS)

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API endpoint

---

## 📄 License

This project is licensed under the MIT License.

---

Developed with ❤️ by [Anurag](https://github.com/your-username)
