# CloudVault

> A modern, full-stack cloud file storage platform — built with React, Node.js, MongoDB, and TypeScript.

---

## ✨ Features

- 🔐 **Secure auth** — JWT + httpOnly cookies, Argon2id password hashing, refresh token rotation
- 📁 **File management** — upload, rename, move, copy, bulk delete, trash/restore
- 📂 **Folders** — nested folder structure, recursive operations
- 👁 **File preview** — images, video, audio, PDF, text, code
- ✏️ **Online editor** — Monaco Editor with autosave, syntax highlighting, version conflict detection
- 🔗 **File sharing** — password-protected links, expiry dates, revoke access
- 💾 **Storage** — per-user quotas, usage by category, real-time accounting
- 🎨 **Premium UI** — dark glassmorphism design, smooth Framer Motion animations
- 🏠 **Local storage** for dev, **S3/R2** for production

---

## 📦 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS v3 |
| Animations | Framer Motion |
| State | TanStack Query + Zustand |
| Editor | Monaco Editor |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + Argon2id |
| Storage | Local FS (dev) / AWS S3 or Cloudflare R2 (prod) |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org)
- **MongoDB** — [Atlas (cloud)](https://cloud.mongodb.com) or local via Docker

### 1. Clone & install

```bash
git clone <your-repo>
cd cloudvault

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI, JWT secrets
```

**Minimum required for local dev:**

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cloudvault
JWT_ACCESS_SECRET=any-32-char-random-string
JWT_REFRESH_SECRET=another-32-char-random-string
STORAGE_PROVIDER=local
```

```bash
# Frontend
cd frontend
cp .env.example .env
# No changes needed for local dev
```

### 3. Start development servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# API runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# UI runs on http://localhost:5173
```

### 4. Open the app

Navigate to **http://localhost:5173** — register an account and start uploading!

---

## 🐳 Docker (MongoDB only)

If you don't have MongoDB installed, run it via Docker:

```bash
docker compose up -d
```

Then set in `backend/.env`:
```env
MONGODB_URI=mongodb://cloudvault:cloudvault_secret@localhost:27017/cloudvault?authSource=admin
```

---

## ☁️ Production Storage (S3 / Cloudflare R2)

Update `backend/.env`:

```env
STORAGE_PROVIDER=s3
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret

# For Cloudflare R2:
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

---

## 📧 Password Reset Emails

In development, reset links are **logged to the backend console**.

For production, set SMTP settings in `backend/.env`:
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=yourpassword
EMAIL_FROM=noreply@cloudvault.app
```

---

## 🏗 Production Build

```bash
# Frontend
cd frontend && npm run build   # outputs to dist/

# Backend
cd backend && npm run build    # outputs to dist/
node dist/server.js
```

---

## 📁 Project Structure

```
cloudvault/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection, env config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation, error handler
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── storage/        # Local + S3 providers
│   │   ├── utils/          # Logger, token, file utils
│   │   ├── validators/     # Zod schemas
│   │   ├── app.ts
│   │   └── server.ts
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── animations/     # Framer Motion variants
│   │   ├── components/     # Reusable UI components
│   │   ├── layouts/        # App and public layouts
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API calls (axios)
│   │   ├── store/          # Zustand stores
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helpers
│   └── package.json
│
├── docker-compose.yml       # Local MongoDB
└── README.md
```

---

## 🔒 Security Notes

- All routes verify JWT and file ownership before any operation
- Storage keys are server-generated UUIDs — users cannot guess other users' keys
- File downloads are proxied through the backend — no direct S3 URL exposure
- Uploaded files are never executed on the server
- Rate limiting on auth endpoints
- Helmet.js for security headers

---

## 📝 API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | No | Logout |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/files` | Yes | List files |
| POST | `/api/files/upload` | Yes | Upload file |
| GET | `/api/files/:id/download` | Yes | Download file |
| PATCH | `/api/files/:id` | Yes | Rename/move/favorite |
| DELETE | `/api/files/:id` | Yes | Trash file |
| POST | `/api/files/:id/restore` | Yes | Restore from trash |
| DELETE | `/api/files/:id/permanent` | Yes | Permanently delete |
| GET | `/api/files/:id/content` | Yes | Get text content |
| PUT | `/api/files/:id/content` | Yes | Save text content |
| GET | `/api/folders` | Yes | List folders |
| POST | `/api/folders` | Yes | Create folder |
| PATCH | `/api/folders/:id` | Yes | Rename folder |
| DELETE | `/api/folders/:id` | Yes | Delete folder |
| POST | `/api/shares` | Yes | Create share link |
| GET | `/api/shares` | Yes | List my shares |
| DELETE | `/api/shares/:id` | Yes | Revoke share |
| GET | `/api/shared/:token` | No | Access shared file |
| GET | `/api/storage/usage` | Yes | Storage stats |

---

## 🐞 Node.js Not Installed?

Download and install Node.js v18 LTS from: **https://nodejs.org/en/download**

After installation, open a **new terminal** and run `node --version` to verify.
