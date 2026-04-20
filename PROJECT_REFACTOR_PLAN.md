# VAULTSNAKE — Project Refactor Plan

> **Cybersecurity Master's Final Project — Secure Vault & Access Monitoring Platform**

---

## Overview

This document describes the transformation of VAULTSNAKE from a Python/Tkinter Snake-game desktop app into a full-stack cybersecurity web application demonstrating secure authentication, access control, encrypted vault storage, audit logging, and threat monitoring.

---

## Current State (Legacy)

All original files archived to `legacy/`:

| File | Description |
|------|-------------|
| `main.py` | Tkinter login GUI with Fernet-encrypted credentials |
| `ghost.py` | Classic Snake game launched post-login |
| `key.py` | Standalone key generator utility |
| `test_app.py` | Unit tests for auth and game logic |
| `highscores.json` | Plaintext JSON score tracker |

**Key issues identified:**
- Passwords stored in plaintext (no hashing)
- Encryption key stored as plaintext file alongside encrypted data
- No audit trail or logging
- No rate limiting or brute-force protection
- Flat-file "database" (JSON)
- Desktop-only, not deployable
- Snake game is the primary product identity

---

## New Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VAULTSNAKE Platform                          │
│                                                                      │
│  ┌──────────────────────┐         ┌───────────────────────────┐     │
│  │   Next.js Frontend   │◄───────►│      FastAPI Backend      │     │
│  │   (Vercel deploy)    │  HTTPS  │    (Python / uvicorn)     │     │
│  │                      │  JWT    │                            │     │
│  │  - NextAuth/Auth.js  │         │  - Auth endpoints          │     │
│  │  - Google OAuth      │         │  - Vault CRUD              │     │
│  │  - Protected routes  │         │  - Audit log endpoints     │     │
│  │  - Dark cyber UI     │         │  - Alert endpoints         │     │
│  └──────────────────────┘         │  - Admin endpoints         │     │
│                                   │  - Threat scoring          │     │
│                                   └───────────┬───────────────┘     │
│                                               │                      │
│                                   ┌───────────▼───────────────┐     │
│                                   │    SQLite (dev)            │     │
│                                   │    PostgreSQL (prod)       │     │
│                                   │    SQLAlchemy ORM          │     │
│                                   └───────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
VAULTSNAKE/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── main.py           # FastAPI app entry point
│   │   ├── config.py         # Settings via Pydantic BaseSettings
│   │   ├── database.py       # SQLAlchemy engine + session
│   │   ├── models/           # ORM models
│   │   │   ├── user.py
│   │   │   ├── vault.py
│   │   │   ├── audit_log.py
│   │   │   └── alert.py
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── api/              # Route handlers
│   │   │   ├── auth.py       # /api/auth/*
│   │   │   ├── vault.py      # /api/vault/*
│   │   │   ├── audit.py      # /api/audit/*
│   │   │   ├── alerts.py     # /api/alerts/*
│   │   │   └── admin.py      # /api/admin/*
│   │   └── core/             # Business logic
│   │       ├── security.py   # JWT creation/verification
│   │       ├── encryption.py # Fernet vault encryption
│   │       ├── audit.py      # Audit log helpers
│   │       └── threat.py     # Suspicious activity detection
│   ├── requirements.txt
│   └── .env.example
├── frontend/                 # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Landing page
│   │   ├── api/auth/         # NextAuth API route
│   │   └── (dashboard)/      # Protected routes group
│   │       ├── layout.tsx    # Dashboard layout + sidebar
│   │       ├── dashboard/    # Main dashboard
│   │       ├── vault/        # Secure vault
│   │       ├── activity/     # Audit log viewer
│   │       ├── alerts/       # Security alerts
│   │       └── admin/        # Admin-only pages
│   ├── components/
│   │   ├── layout/           # Sidebar, Navbar
│   │   └── ui/               # Cards, badges, etc.
│   ├── lib/
│   │   ├── api.ts            # Backend API client
│   │   └── auth.ts           # Auth helpers
│   ├── types/index.ts
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example
├── legacy/                   # Original Tkinter/Snake code
├── PROJECT_REFACTOR_PLAN.md
└── README.md
```

---

## Authentication Flow

```
User → "Sign in with Google" → NextAuth → Google OAuth
     ↓
  Google returns id_token + profile
     ↓
  NextAuth signIn callback → POST /api/auth/sync (backend)
     ↓
  Backend verifies Google token → creates/retrieves user → issues JWT
     ↓
  JWT stored in NextAuth session → used for all API calls
     ↓
  Backend validates JWT on every protected endpoint
```

---

## Security Implementations

| Area | Implementation |
|------|---------------|
| Authentication | Google OAuth 2.0 via NextAuth, JWT-based API auth |
| Passwords | No passwords — OAuth only (inherits Google security) |
| Vault encryption | Fernet symmetric encryption, master key from env var |
| Role-based access | `user` / `admin` roles enforced in backend middleware |
| Audit logging | Every security event logged with timestamp + IP |
| Threat detection | Risk score based on recent events; alerts auto-generated |
| Input validation | Pydantic schemas on all endpoints |
| Error handling | No stack traces or secrets exposed to clients |
| Secrets | All secrets via environment variables, never hardcoded |
| CORS | Explicit allowlist of frontend origins |

---

## Core Modules

### 1. Authentication (`/api/auth/`)
- `POST /api/auth/sync` — Sync Google user, issue backend JWT
- `GET /api/auth/me` — Get current user profile

### 2. Vault (`/api/vault/`)
- `GET /api/vault/` — List vault items (titles only, content encrypted)
- `POST /api/vault/` — Create vault item (content encrypted before DB storage)
- `GET /api/vault/{id}` — Retrieve + decrypt single item
- `PUT /api/vault/{id}` — Update vault item
- `DELETE /api/vault/{id}` — Delete vault item

### 3. Audit Logs (`/api/audit/`)
- `GET /api/audit/` — Get own audit logs
- `GET /api/audit/summary` — Get event summary stats

### 4. Alerts (`/api/alerts/`)
- `GET /api/alerts/` — Get own security alerts
- `PUT /api/alerts/{id}/resolve` — Resolve an alert

### 5. Admin (`/api/admin/`)
- `GET /api/admin/users` — List all users (admin only)
- `GET /api/admin/audit` — All audit logs (admin only)
- `GET /api/admin/alerts` — All alerts (admin only)
- `PUT /api/admin/users/{id}/role` — Update user role (admin only)

---

## Threat Detection Logic

The `threat.py` module implements:

1. **Repeated unauthorized access** — 3+ admin page hits by non-admin → alert
2. **Rapid vault operations** — >10 vault actions in 5 minutes → warning
3. **Multiple failed auth attempts** — tracked via audit log → alert
4. **Risk score calculation** — based on recent 24h event severity
   - `info` events = 0 pts
   - `warning` events = 2 pts
   - `critical` events = 5 pts
   - Score 0–10: Low | 11–25: Medium | 26–50: High | 50+: Critical

---

## Milestones

- [x] **M1** — Legacy code archived to `legacy/`
- [x] **M2** — Refactor plan created
- [x] **M3** — Backend: FastAPI app, models, schemas, core utilities
- [x] **M4** — Backend: Auth, vault, audit, alerts, admin API routes
- [x] **M5** — Frontend: Next.js app, NextAuth, protected routes
- [x] **M6** — Frontend: Dashboard, vault, activity, alerts, admin pages
- [x] **M7** — README rewritten, .env.example files created
- [ ] **M8** — Deploy backend (Railway / Render)
- [ ] **M9** — Deploy frontend (Vercel)
- [ ] **M10** — PostgreSQL migration for production

---

## Removed / Archived

- `main.py` → `legacy/main.py` (Tkinter login GUI)
- `ghost.py` → `legacy/ghost.py` (Snake game)
- `key.py` → `legacy/key.py` (Key generator)
- `test_app.py` → `legacy/test_app.py` (Old tests)
- `highscores.json` → `legacy/highscores.json` (Score data)

The Snake game identity is **fully retired**. The Fernet encryption pattern is **preserved and upgraded** in `backend/app/core/encryption.py`.
