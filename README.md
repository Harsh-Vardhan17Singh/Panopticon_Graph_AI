# 🛡️ Panopticon

> Enterprise Graph Intelligence Platform for Real-Time Financial Fraud Detection.

Panopticon is an enterprise-grade fraud intelligence platform designed to detect sophisticated financial fraud using Graph Intelligence, Graph Neural Networks (GNNs), Explainable AI, and interactive investigation tools.

Instead of analysing transactions individually, Panopticon builds a relationship graph between users, accounts, devices, merchants, IP addresses, and transactions to identify coordinated fraud rings that traditional systems often miss.

---

# 🚀 Current Status

**Version:** `v0.2.0-alpha`(working on v3 and done wuth model addition)

**Status:** 🟢 Active Development

Current Phase:

> Backend Foundation Completed ( Addition of models)

---

# 📌 Vision

Our goal is to build an enterprise SaaS platform capable of:

- Real-Time Fraud Detection
- Fraud Ring Detection
- Graph Intelligence
- Explainable AI
- Interactive Investigation Dashboard
- Case Management
- Analytics
- Enterprise APIs

---

# 🏗️ Tech Stack

## Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Three.js (Upcoming)
- Framer Motion

## Backend

- FastAPI
- SQLAlchemy
- Python
- SQLite (Development)

## Future

- PostgreSQL
- Neo4j
- Redis
- Docker
- AWS
- PyTorch
- PyTorch Geometric

---

# 📁 Project Structure

```text
Panopticon/

├── frontend/
│
├── backend/
│   ├── app/
│   │
│   ├── api/
│   ├── core/
│   ├── db/
│   ├── graph/
│   ├── middleware/
│   ├── ml/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   │
│   └── main.py
│
├── tests/
│
└── README.md
```

---

# ✅ Implemented Features

## Backend

- ✅ FastAPI Initialisation
- ✅ Versioned API (`/api/v1`)
- ✅ Health Check Endpoint
- ✅ Environment Configuration
- ✅ SQLAlchemy Configuration
- ✅ Database Session
- ✅ Database Initialisation
- ✅ Base Model
- ✅ User Model
- ✅ Organisation Model
- ✅ Modular Router Structure
- ✅ Typed Response Schemas
- ✅ Dependency Injection Structure
- ✅ Constants Module

---

## Frontend

- ✅ Next.js Initialised
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Development Server Running

---

# 📡 API Endpoints

## Root

```http
GET /
```

Response

```json
{
  "message": "Panopticon API Running 🚀",
  "version": "1.0.0"
}
```

---

## Health

```http
GET /api/v1/health
```

Response

```json
{
  "status": "healthy",
  "service": "Panopticon Backend",
  "version": "1.0.0"
}
```

---

# 🗃️ Database Models

## Implemented

- User
- Organisation

## Planned

- Account
- Device
- Merchant
- Transaction
- Fraud Case
- Alert
- Investigation

---

# 🛣️ Development Roadmap

## ✅ Phase 1 — Backend Foundation

- FastAPI Setup
- Project Structure
- SQLAlchemy
- Database Layer
- Config Management
- Health API
- User & Organisation Models

---

## 🚧 Phase 2 — Fraud Domain

- Account Model
- Device Model
- Merchant Model
- Transaction Model
- Fraud Case Model
- Alert Model
- Relationships

---

## ⏳ Phase 3 — Authentication

- JWT
- Login
- Signup
- RBAC
- Multi-Tenant Organisations

---

## ⏳ Phase 4 — Graph Intelligence

- Neo4j
- Graph Builder
- Community Detection
- Graph APIs

---

## ⏳ Phase 5 — AI Engine

- Graph Neural Networks
- Risk Scoring
- Explainable AI
- Fraud Prediction

---

## ⏳ Phase 6 — Dashboard

- Authentication UI
- Fraud Monitoring
- Graph Explorer
- Analytics
- Investigation Workspace

---

## ⏳ Phase 7 — Production

- Docker
- CI/CD
- Monitoring
- Cloud Deployment
- Documentation

---

# 📌 Commit History

## v0.1.0-alpha

- Initial repository structure
- Frontend setup with Next.js
- Backend setup with FastAPI
- Environment configuration

---

## v0.2.0-alpha

- SQLAlchemy integration
- Database session
- Base model
- User model
- Organisation model
- Database initialisation
- Modular API routing
- Typed response schemas
- Dependency structure
- Backend architecture improvements

---

# 🎯 Long-Term Goal

Panopticon aims to become an enterprise platform that enables banks, fintech companies, payment gateways, insurance providers, and digital financial institutions to detect sophisticated fraud networks using graph intelligence, machine learning, and explainable AI.

---

# 👨‍💻 Development Philosophy

This project is being developed using a production-first approach.

frontend is deployed at - Vercel 
backend is deployed at - ( currently working on the backend file .)

Every feature is designed to be:

- Modular
- Scalable
- Maintainable
- Enterprise-ready
- AI-first

---

Report till 1 Aug 
- The backend Development phase is active and done till model addition.

# 📄 License

Currently under active development.
