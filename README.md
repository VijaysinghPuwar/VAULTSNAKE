# VAULTSNAKE

**Secure Vault & Access Monitoring Platform**

A full-stack cybersecurity web application built as a Cybersecurity Master's final project.
Demonstrates authentication, authorization, encrypted secret storage, real-time audit logging, and automated threat detection.

---

## Overview

VAULTSNAKE is not a demo app — it is a platform designed around security principles.
Users authenticate via Google OAuth, store encrypted secrets in a personal vault,
and can monitor all security events on their account. Admins have a separate monitoring
dashboard with platform-wide visibility.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VAULTSNAKE Platform                          │
│                                                                     │
│   Next.js 15 (Vercel)           FastAPI (Python)                   │
│   ─────────────────             ────────────────                   │
│   Google OAuth via NextAuth  →  JWT validation                     │
│   Protected app routes       →  Role-enforced endpoints            │
│   Dark cybersecurity UI      →  SQLAlchemy + SQLite/PostgreSQL     │
│                              →  Fernet vault encryption            │
│                              →  Threat detection engine            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Security Features

| Feature | Implementation |
|---------|----------------|
| **Authentication** | Google OAuth 2.0 via NextAuth/Auth.js |
| **Session security** | JWT tokens — server-side validation on every endpoint |
| **Vault encryption** | Fernet symmetric encryption (AES-128-CBC + HMAC-SHA256) |
| **Role-based access** | `user` / `admin` roles enforced in backend middleware |
| **Audit logging** | Every security event logged with timestamp, severity, and IP |
| **Threat detection** | Automated alerts: brute force, rapid vault ops, escalation attempts |
| **Risk scoring** | Dynamic score from 24h event history |
| **Input validation** | Pydantic schemas on all endpoints |
| **No hardcoded secrets** | All sensitive values via environment variables |
| **CORS protection** | Explicit allowlist of frontend origins |
| **Error safety** | No stack traces or secrets exposed in API responses |

---

## Tech Stack

**Frontend**
- Next.js 15 (App Router)
- NextAuth v5 (Auth.js) — Google OAuth
- Tailwind CSS — dark cybersecurity theme
- TypeScript
- SWR — data fetching
- Deployed on Vercel

**Backend**
- FastAPI (Python 3.11+)
- SQLAlchemy 2.0 — ORM
- SQLite (dev) / PostgreSQL (prod)
- python-jose — JWT creation/verification
- cryptography (Fernet) — vault encryption
- Pydantic — request/response validation
- uvicorn — ASGI server

---

## Pages

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page + Google sign-in |
| `/dashboard` | Authenticated | Security overview, risk score, recent events |
| `/vault` | Authenticated | Encrypted vault CRUD |
| `/activity` | Authenticated | Personal audit log |
| `/alerts` | Authenticated | Security alerts + risk score |
| `/admin` | Admin only | Platform stats overview |
| `/admin/users` | Admin only | User management + role control |
| `/admin/logs` | Admin only | All audit logs + all alerts |

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 20+
- A Google Cloud project with OAuth 2.0 credentials

### 1. Clone and set up

```bash
git clone <your-repo>
cd VAULTSNAKE
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env — fill in JWT_SECRET_KEY, VAULT_ENCRYPTION_KEY, GOOGLE_CLIENT_ID, etc.

uvicorn app.main:app --reload --port 8000
```

Generate required keys:
```bash
# JWT secret
python -c "import secrets; print(secrets.token_hex(32))"

# Vault encryption key (Fernet)
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

API docs available at: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install

cp .env.example .env.local
# Edit .env.local — fill in NEXTAUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET

npm run dev
```

App runs at: http://localhost:3000

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://your-app.vercel.app/api/auth/callback/google` (prod)
5. Copy Client ID and Secret to both `.env` files

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `JWT_SECRET_KEY` | Random 32-byte hex string for JWT signing |
| `JWT_EXPIRE_MINUTES` | Token lifetime (default: 60) |
| `VAULT_ENCRYPTION_KEY` | Fernet key for vault encryption |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `DATABASE_URL` | SQLite or PostgreSQL connection string |
| `ALLOWED_ORIGINS` | Comma-separated frontend URLs |
| `ADMIN_EMAIL` | Email auto-promoted to admin on first login |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_SECRET` | Random base64 string for NextAuth JWT |
| `NEXTAUTH_URL` | Full app URL (e.g. `http://localhost:3000`) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `NEXT_PUBLIC_API_URL` | Backend API URL |

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npx vercel deploy
```

Or connect your GitHub repo to Vercel — it will auto-detect Next.js.

Set all environment variables in the Vercel dashboard under:
**Project → Settings → Environment Variables**

Update `NEXTAUTH_URL` to your production Vercel URL.
Add production callback URL to Google OAuth credentials.

### Backend → Railway / Render / Fly.io

**Railway (recommended):**

1. Create new project → Deploy from GitHub
2. Select the `backend/` directory as root
3. Set environment variables in Railway dashboard
4. Change `DATABASE_URL` to a PostgreSQL URL for production

**Start command:**
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**PostgreSQL migration:**
Change `DATABASE_URL` from SQLite to:
```
postgresql://user:password@host:5432/vaultsnake
```
SQLAlchemy handles the rest — same code, different driver.

---

## Project Structure

```
VAULTSNAKE/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app entry point
│   │   ├── config.py         # Settings via pydantic-settings
│   │   ├── database.py       # SQLAlchemy engine + session
│   │   ├── models/           # ORM models (User, VaultItem, AuditLog, Alert)
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── api/              # Route handlers
│   │   └── core/
│   │       ├── security.py   # JWT creation/verification + auth deps
│   │       ├── encryption.py # Fernet vault encryption
│   │       ├── audit.py      # Audit log helpers
│   │       └── threat.py     # Threat detection + risk scoring
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   ├── (dashboard)/      # Protected routes group
│   │   │   ├── dashboard/    # Security overview dashboard
│   │   │   ├── vault/        # Encrypted vault management
│   │   │   ├── activity/     # Personal audit log view
│   │   │   ├── alerts/       # Security alerts + risk score
│   │   │   └── admin/        # Admin-only pages
│   │   └── api/auth/         # NextAuth route handler
│   ├── components/
│   │   ├── layout/Sidebar.tsx
│   │   └── ui/               # SeverityBadge, StatCard
│   ├── lib/
│   │   ├── api.ts            # Typed backend API client
│   │   └── auth.ts           # NextAuth configuration
│   └── types/index.ts        # Shared TypeScript interfaces
├── legacy/                   # Original Tkinter/Snake code (archived)
├── PROJECT_REFACTOR_PLAN.md
└── README.md
```

---

## Cybersecurity Concepts Demonstrated

This project demonstrates the following cybersecurity principles:

- **Authentication** — OAuth 2.0 + JWT-based session management
- **Authorization** — Role-based access control (RBAC) enforced server-side
- **Least privilege** — Users can only access their own data
- **Encryption at rest** — Vault content encrypted with Fernet (AES-128-CBC + HMAC)
- **Audit trail** — Immutable log of all security-relevant events with severity levels
- **Threat monitoring** — Automated detection of suspicious behavioral patterns
- **Risk quantification** — Numeric risk scores derived from event severity
- **Defense in depth** — Frontend route guards AND backend JWT enforcement
- **Secure defaults** — API docs disabled in production, no secrets in code
- **Input validation** — All inputs validated and constrained via Pydantic

---

## Future Improvements

- [ ] PostgreSQL in production with Alembic migrations
- [ ] Email/webhook notifications on critical alerts
- [ ] TOTP two-factor authentication option
- [ ] Vault item sharing with expiry tokens
- [ ] Rate limiting middleware on auth endpoints
- [ ] SIEM-style log export (CSV/JSON)
- [ ] Per-user encryption keys via key derivation
- [ ] WebSocket live alert feed

---

## Legacy

The original VAULTSNAKE was a Python/Tkinter Snake game with a Matrix-themed login screen.
The Fernet encryption pattern from that project has been upgraded and carried forward into
this platform's vault encryption module (`backend/app/core/encryption.py`).
All original code is preserved in `legacy/`.

---

*Cybersecurity Master's Program — Intro to Python Final Project*
