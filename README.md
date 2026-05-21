# StaySync

StaySync is a full-stack hostel and PG management platform built for property owners, administrators, and students. It centralizes daily operations such as student onboarding, room allocation, rent tracking, complaints, leave approvals, digital gate pass verification, and announcements into one role-based web application.

The project is structured as a modern MERN-style application with a Next.js frontend and an Express.js backend backed by MongoDB. Redis is used as an optional cache layer for dashboard and reporting data, while Razorpay and SMTP support online rent collection, PDF receipts, and email delivery.

---

## Table of Contents

- [Project Highlights](#project-highlights)
- [Core Modules](#core-modules)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [Application Workflows](#application-workflows)
- [Data Models](#data-models)
- [Security and Reliability](#security-and-reliability)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)

---

## Project Highlights

- Role-based authentication for admins and students
- Admin dashboard for rooms, students, revenue, complaints, leaves, and announcements
- Student dashboard for room details, dues, payments, complaints, leaves, and notifications
- Room allocation with occupancy tracking and automatic first payment ledger creation
- Rule-based NLP complaint classification for categories such as Electricity, Water, WiFi, Maintenance, Cleanliness, and Security
- Rent ledger with status tracking for Paid, Pending, and Overdue payments
- Razorpay payment order creation and signature verification
- PDF invoice generation with optional email delivery through SMTP
- Leave request approval flow with QR token generation for gate pass verification
- Public QR verification endpoint for guards/security staff
- Redis-backed caching for frequently accessed statistics and charts
- Protected REST API with JWT Bearer tokens
- Responsive Next.js frontend using Tailwind CSS and reusable dashboard layout components

---

## Core Modules

### Admin Features

- **Dashboard analytics:** View high-level operational metrics for students, rooms, payments, complaints, and leave requests.
- **Room management:** Create, update, delete, filter, and monitor rooms by floor, capacity, rent, amenities, and occupancy status.
- **Student management:** View students, update profile/status fields, and remove students when needed.
- **Room allocation:** Assign students to available rooms, update room occupancy, update the student's assigned room, and generate a pending rent record automatically.
- **Complaint management:** Review student complaints, filter by status/category, update status, add admin notes, set priority, and track resolution.
- **Payment management:** Create monthly payment records, update payment status, view revenue stats, view monthly revenue chart data, and download invoices.
- **Leave management:** Review leave requests, approve/reject requests, add admin notes, and generate QR-enabled gate passes on approval.
- **Notifications:** Broadcast announcements or targeted messages to students.

### Student Features

- **Personal dashboard:** Access assigned room details, payments, announcements, and recent activity.
- **Complaint submission:** Submit complaints with title, description, category, and priority. The backend auto-classifies complaint text as an intelligent default.
- **Payment tracking:** View personal rent dues, payment history, status, and invoice downloads.
- **Online payment support:** Initiate Razorpay orders and verify successful transactions.
- **Leave applications:** Apply for leave with reason, departure date, and return date.
- **Digital gate pass:** Approved leave requests receive QR tokens that can be verified from a public gate-pass verification page.
- **Notifications:** Receive announcements and mark messages as read.

---

## Tech Stack

### Frontend

| Area | Technology |
| --- | --- |
| Framework | Next.js 14 with App Router |
| Language | TypeScript |
| UI | React 18 |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Charts | Recharts |
| QR Rendering | qrcode.react |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Date Utilities | date-fns |

### Backend

| Area | Technology |
| --- | --- |
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Auth | JWT, bcryptjs |
| Validation | express-validator |
| Cache | Redis, optional |
| Payments | Razorpay |
| PDF Generation | PDFKit |
| Email | Nodemailer |
| Security Middleware | helmet, cors |
| Logging | morgan |
| Compression | compression |

---

## System Architecture

```text
+-----------------------------+
|       Next.js Frontend      |
|  Landing, Auth, Dashboards  |
+--------------+--------------+
               |
               | Axios + JWT Bearer token
               v
+-----------------------------+
|       Express REST API      |
| Auth, Users, Rooms, Payments|
| Complaints, Leaves, Notices |
+-------+-----------+---------+
        |           |
        v           v
+--------------+ +--------------+
|   MongoDB    | |    Redis     |
| Main storage | | Stats cache  |
+--------------+ +--------------+
        |
        +-- Razorpay payment orders and verification
        +-- PDFKit + Nodemailer invoice generation
```

### Request Flow

1. A user logs in or registers from the frontend.
2. The backend validates credentials and returns a signed JWT.
3. The frontend stores the token in `localStorage`.
4. Axios attaches the token as `Authorization: Bearer <token>` on protected requests.
5. Express middleware verifies the token and loads the user from MongoDB.
6. Role-based middleware restricts admin-only routes.
7. Controllers read/write MongoDB and invalidate Redis cache keys when data changes.

---

## Folder Structure

```text
StaySync/
|-- README.md
|-- backend/
|   |-- config/
|   |   |-- db.js
|   |   `-- redis.js
|   |-- controllers/
|   |   |-- authController.js
|   |   |-- complaintController.js
|   |   |-- leaveController.js
|   |   |-- notificationController.js
|   |   |-- paymentController.js
|   |   |-- roomController.js
|   |   `-- userController.js
|   |-- middleware/
|   |   |-- auth.js
|   |   `-- error.js
|   |-- models/
|   |   |-- Complaint.js
|   |   |-- Leave.js
|   |   |-- Notification.js
|   |   |-- Payment.js
|   |   |-- Room.js
|   |   `-- User.js
|   |-- routes/
|   |   |-- auth.js
|   |   |-- complaints.js
|   |   |-- leaves.js
|   |   |-- notifications.js
|   |   |-- payments.js
|   |   |-- rooms.js
|   |   `-- users.js
|   |-- utils/
|   |   `-- classifier.js
|   |-- package.json
|   `-- server.js
`-- frontend/
    |-- app/
    |   |-- admin/
    |   |-- login/
    |   |-- register/
    |   |-- student/
    |   |-- verify-gate-pass/
    |   |-- globals.css
    |   |-- layout.tsx
    |   `-- page.tsx
    |-- components/
    |   |-- layout/
    |   `-- ProtectedRoute.tsx
    |-- context/
    |   `-- AuthContext.tsx
    |-- lib/
    |   `-- api.ts
    |-- package.json
    `-- tailwind.config.ts
```

---

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js `18.x` or higher
- npm
- MongoDB Atlas account or local MongoDB server
- Redis instance, optional but recommended for cached dashboard statistics
- Razorpay account, optional for online payments
- SMTP account, optional for email invoices

### 1. Clone the Repository

```bash
git clone <repository-url>
cd StaySync
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
NODE_ENV=development
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/staysync

JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRE=30d

CLIENT_URL=http://localhost:3000

REDIS_URL=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

Start the backend:

```bash
npm run dev
```

The API will run at:

```text
http://localhost:5000/api
```

Health check:

```text
GET http://localhost:5000/api/health
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file inside `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The app will run at:

```text
http://localhost:3000
```

---

## Environment Variables

### Backend Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | No | Runtime environment. Use `development` locally and `production` in deployment. |
| `PORT` | No | Backend port. Defaults to `5000`. |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Secret key used to sign and verify JWTs. |
| `JWT_EXPIRE` | Yes | JWT expiry value, for example `30d`. |
| `CLIENT_URL` | Recommended | Frontend URL allowed by CORS in production. |
| `REDIS_URL` | No | Redis connection URL. Supports `redis://` and `rediss://`. App works without Redis using safe no-op cache methods. |
| `RAZORPAY_KEY_ID` | For online payment | Razorpay key ID used to create payment orders. |
| `RAZORPAY_KEY_SECRET` | For online payment | Razorpay secret used for order creation and signature verification. |
| `SMTP_HOST` | For email invoices | SMTP host for sending PDF receipts. |
| `SMTP_PORT` | For email invoices | SMTP port. Defaults to `587` in code. |
| `SMTP_USER` | For email invoices | SMTP username/from address. |
| `SMTP_PASS` | For email invoices | SMTP password or app password. |

### Frontend Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Recommended | Base API URL used by Axios. Defaults to `http://localhost:5000/api`. |

---

## Available Scripts

### Backend

Run from `backend/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Express API with Nodemon. |
| `npm start` | Starts the Express API with Node. |

### Frontend

Run from `frontend/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Next.js development server. |
| `npm run build` | Creates a production build. |
| `npm start` | Starts the production Next.js server after build. |
| `npm run lint` | Runs Next.js linting. |

---

## API Overview

Base URL:

```text
http://localhost:5000/api
```

Protected endpoints require:

```http
Authorization: Bearer <jwt_token>
```

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Register a student or admin account. |
| `POST` | `/auth/login` | Public | Login and receive JWT plus user data. |
| `GET` | `/auth/me` | Private | Get current logged-in user with room details. |

### Users

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/users/stats` | Admin | Get total and active student counts. |
| `GET` | `/users` | Admin | List users with optional role filter and pagination. |
| `GET` | `/users/:id` | Private | Get a single user. |
| `PUT` | `/users/:id` | Private | Update allowed profile fields. Admin can also update role/status. |
| `DELETE` | `/users/:id` | Admin | Delete user and remove them from allocated room if needed. |

### Rooms

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/rooms/stats` | Admin | Get room totals by status. |
| `GET` | `/rooms` | Private | List rooms. Supports `status` and `floor` query filters. |
| `POST` | `/rooms` | Admin | Create a room. |
| `GET` | `/rooms/:id` | Private | Get one room with assigned students. |
| `PUT` | `/rooms/:id` | Admin | Update room data. |
| `DELETE` | `/rooms/:id` | Admin | Delete room only if not occupied. |
| `POST` | `/rooms/:id/allocate` | Admin | Allocate a student to a room and generate initial payment record. |
| `POST` | `/rooms/:id/deallocate` | Admin | Remove a student from a room. |

### Complaints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/complaints/stats` | Private | Get complaint statistics. Admin sees global stats, students see own stats. |
| `GET` | `/complaints` | Private | List complaints. Supports `status`, `category`, `page`, and `limit`. |
| `POST` | `/complaints` | Private | Create complaint with automatic category classification. |
| `GET` | `/complaints/:id` | Private | Get one complaint. Students can only access their own complaint. |
| `PUT` | `/complaints/:id` | Private | Admin updates status/note/priority; student can edit pending complaint description. |
| `DELETE` | `/complaints/:id` | Private | Delete complaint with ownership checks. |

### Payments

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/payments/stats` | Private | Get paid, pending, overdue, and revenue stats. |
| `GET` | `/payments/revenue-chart` | Private | Get monthly revenue chart data. |
| `GET` | `/payments` | Private | List payments. Students see their own payments; admins can filter by student/status/month/year. |
| `POST` | `/payments` | Admin | Create a payment record. |
| `PUT` | `/payments/:id` | Admin | Update status, method, transaction ID, and notes. |
| `POST` | `/payments/:id/create-order` | Private | Create a Razorpay order for a payment. |
| `POST` | `/payments/verify` | Private | Verify Razorpay signature and mark payment as paid. |
| `GET` | `/payments/:id/invoice` | Private | Download a PDF invoice for a paid payment. |

### Notifications

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/notifications` | Private | Get sent notifications for admin or received notifications for student. |
| `POST` | `/notifications` | Admin | Create announcement or targeted notification. |
| `PUT` | `/notifications/read-all` | Private | Mark all accessible notifications as read. |
| `PUT` | `/notifications/:id/read` | Private | Mark one notification as read. |
| `DELETE` | `/notifications/:id` | Private | Delete notification if admin or sender is authorized. |

### Leaves and Gate Pass

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/leaves/verify/:token` | Public | Verify QR gate pass token. |
| `GET` | `/leaves/stats` | Admin | Get leave counts by status. |
| `GET` | `/leaves/my-leaves` | Private | Get current student's leave requests. |
| `POST` | `/leaves/apply` | Private | Apply for leave. |
| `GET` | `/leaves` | Admin | List all leave requests. Supports `status` query filter. |
| `PATCH` | `/leaves/:id/status` | Admin | Approve or reject a leave request. Approval generates QR token. |

---

## Application Workflows

### Authentication Flow

1. User registers or logs in.
2. Backend validates credentials and returns a JWT.
3. Frontend stores token in `localStorage`.
4. `AuthContext` loads the user through `/auth/me` on app start.
5. Users are redirected to `/admin/dashboard` or `/student/dashboard` according to role.

### Room Allocation Flow

1. Admin creates rooms with capacity, floor, type, rent, and amenities.
2. Admin selects a student and allocates them to a room.
3. Backend checks room availability.
4. If the student already has a room, they are removed from the old room.
5. Student is added to the new room.
6. Room occupancy and status are recalculated.
7. A pending payment record is created for the current month.
8. Room and payment cache keys are invalidated.

### Complaint Flow

1. Student submits a complaint title and description.
2. Backend combines title and description and passes them to the classifier.
3. The classifier checks keyword matches across known categories.
4. Complaint is saved with both selected/final category and auto-classified category.
5. Admin reviews and updates status, priority, and admin notes.
6. Complaint statistics cache is invalidated on changes.

### Payment Flow

1. Payment records are created manually by admin or automatically during room allocation.
2. Student can view pending payments.
3. For online payment, backend creates a Razorpay order.
4. After payment, Razorpay details are sent to `/payments/verify`.
5. Backend validates the HMAC signature.
6. Payment is marked as `Paid`, transaction ID is stored, and `paidAt` is set.
7. PDF receipt is generated with PDFKit.
8. If SMTP is configured, invoice is emailed to the student.

### Leave and Gate Pass Flow

1. Student applies for leave with reason, departure date, and return date.
2. Backend validates that return date is after departure date.
3. Admin approves or rejects the request.
4. On approval, a unique QR token is generated.
5. Student dashboard can render QR gate pass.
6. Security staff can scan/open the public verification URL.
7. Backend validates token, approval status, and date range.
8. First successful scan stores `qrScannedAt`.

---

## Data Models

### User

Stores account and profile details:

- `name`, `email`, `password`
- `role`: `student` or `admin`
- `phone`
- `room`
- `profileImage`
- `isActive`

Passwords are hashed using bcrypt before saving. JWT payload contains the user ID and role.

### Room

Stores accommodation details:

- `roomNumber`
- `floor`
- `type`: `Single`, `Double`, `Triple`, `Dormitory`
- `capacity`
- `occupied`
- `students`
- `rent`
- `amenities`
- `status`: `Available`, `Occupied`, `Full`, `Maintenance`
- `description`

Room status is recalculated before save based on occupancy and capacity.

### Complaint

Stores student complaints:

- `student`
- `title`
- `description`
- `category`
- `autoCategory`
- `status`: `Pending`, `In Progress`, `Resolved`, `Rejected`
- `priority`: `Low`, `Medium`, `High`
- `adminNote`
- `resolvedAt`
- `room`

### Payment

Stores rent ledger records:

- `student`
- `room`
- `amount`
- `month`
- `year`
- `status`: `Paid`, `Pending`, `Overdue`
- `paymentMethod`: `Cash`, `Online`, `UPI`, `Bank Transfer`
- `transactionId`
- `paidAt`
- `dueDate`
- `notes`

Pending payments automatically become overdue on save if the due date has passed.

### Leave

Stores student leave requests:

- `student`
- `reason`
- `departureDate`
- `returnDate`
- `status`: `Pending`, `Approved`, `Rejected`
- `adminNote`
- `qrToken`
- `qrScannedAt`
- `approvedBy`

The model validates that return date must be after departure date.

### Notification

Stores announcements and messages:

- `title`
- `message`
- `type`: `Announcement`, `Complaint`, `Payment`, `Room`, `General`
- `sentBy`
- `recipients`: `all` or comma-separated user IDs
- `readBy`

---

## Security and Reliability

- Passwords are hashed with bcrypt before storing.
- Protected API routes require JWT Bearer tokens.
- Admin-only actions are guarded with role authorization middleware.
- CORS restricts production origins through `CLIENT_URL`.
- Helmet sets security-related HTTP headers.
- Express request bodies are parsed safely through JSON and URL-encoded middleware.
- Centralized error middleware normalizes error responses.
- Redis is optional and wrapped in a safe proxy so the app continues running when Redis is unavailable.
- Cache invalidation happens after mutations to rooms, users, payments, complaints, and leaves.
- Razorpay payment verification uses HMAC SHA-256 signature comparison.
- Gate pass verification validates token existence, approval status, and date range.

---

## Deployment Guide

### Backend Deployment

Recommended platforms:

- Render
- Railway
- Fly.io
- VPS with Node.js and PM2

Typical backend settings:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Required production environment variables:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=<mongodb-atlas-uri>
JWT_SECRET=<strong-secret>
JWT_EXPIRE=30d
CLIENT_URL=https://your-frontend-domain.com
```

Optional production integrations:

```env
REDIS_URL=<redis-or-rediss-url>
RAZORPAY_KEY_ID=<razorpay-key-id>
RAZORPAY_KEY_SECRET=<razorpay-key-secret>
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USER=<smtp-user>
SMTP_PASS=<smtp-password>
```

### Frontend Deployment

Recommended platform:

- Vercel

Typical frontend settings:

```text
Root Directory: frontend
Framework Preset: Next.js
Build Command: npm run build
Output: .next
```

Frontend environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

### Production Checklist

- Use a strong `JWT_SECRET`.
- Set `NODE_ENV=production`.
- Set `CLIENT_URL` to the exact frontend domain.
- Use MongoDB Atlas or a secure managed MongoDB instance.
- Configure Redis only if a stable Redis provider is available.
- Configure Razorpay keys only on the backend.
- Configure SMTP credentials if invoice emails are required.
- Ensure frontend `NEXT_PUBLIC_API_URL` points to the deployed backend `/api` URL.
- Test login, room allocation, payment verification, invoice download, and gate pass verification after deployment.

---

## Troubleshooting

### MongoDB Connection Error

Check:

- `MONGO_URI` is present in `backend/.env`.
- MongoDB server is running if using local MongoDB.
- MongoDB Atlas IP allowlist includes your deployment/server IP.
- Username and password in the connection string are correct.

### API Requests Failing From Frontend

Check:

- Backend is running on `http://localhost:5000`.
- Frontend has `NEXT_PUBLIC_API_URL=http://localhost:5000/api`.
- In production, backend `CLIENT_URL` exactly matches the frontend domain.
- Browser console is not showing CORS errors.

### Unauthorized or Token Errors

Check:

- User is logged in.
- Token exists in `localStorage`.
- `JWT_SECRET` has not changed after token generation.
- The request includes `Authorization: Bearer <token>`.

### Redis Warning

If `REDIS_URL` is missing, the backend logs a warning and continues without cache. This is expected in local development.

### Razorpay Is Not Configured

Add both:

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Restart the backend after updating `.env`.

### Invoice Email Not Sending

Check:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` are configured.
- The SMTP provider allows app passwords or SMTP access.
- Payment was successfully verified and marked as paid.

If SMTP is not configured, the invoice PDF is still generated locally by the backend when possible.

---

## Future Enhancements

- Super admin and multi-property support
- Dedicated staff roles for maintenance, security, and accounts
- Real-time notifications with WebSockets
- Advanced complaint assignment and SLA tracking
- Automated recurring monthly rent generation
- Payment webhooks for stronger payment reconciliation
- File uploads for complaint images and profile photos
- Email/SMS alerts for leave approvals, dues, and announcements
- Audit logs for admin actions
- Unit, integration, and end-to-end test coverage
- Docker Compose setup for local MongoDB, Redis, backend, and frontend

---

## Author

Developed by Anurag Kumar.

StaySync is designed as a professional full-stack project for modern hostel and PG operations, combining clean dashboards, practical admin workflows, student self-service, and reliable backend APIs.
