# 🛡️ Panopticon

> An Enterprise Graph Intelligence Platform for Real-Time Financial Fraud Detection.

Panopticon is a production-oriented fintech platform designed to detect fraud using Graph Intelligence, Graph Neural Networks (GNNs), and Explainable AI.

Instead of analysing transactions individually, Panopticon models the relationships between users, accounts, devices, merchants, IP addresses, and transactions to identify coordinated fraud rings and suspicious activity.

---

# 🚀 Vision

Our goal is to build an enterprise-grade Fraud Intelligence Platform that provides:

- Graph-Based Fraud Detection
- Fraud Ring Detection
- Real-Time Risk Scoring
- Explainable AI
- Interactive Graph Investigation
- Case Management
- Analytics Dashboard
- REST APIs for Enterprise Integration

---

# 🏗️ Tech Stack

## Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Three.js (Upcoming)

## Backend

- FastAPI
- SQLAlchemy
- Python
- SQLite (Current Development Database)

## Future Integrations

- PostgreSQL
- Neo4j
- Redis
- PyTorch
- PyTorch Geometric
- Docker
- AWS

---

# 📁 Project Structure

```
Panopticon/

├── frontend/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── graph/
│   │   ├── middleware/
│   │   ├── ml/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.py
│   │
│   ├── tests/
│   └── venv/
│
└── README.md
```

---

# ✅ Current Progress

### Backend

- [x] FastAPI Project Setup
- [x] Environment Configuration
- [x] Versioned API Structure
- [x] Health Check Endpoint
- [x] SQLAlchemy Setup
- [x] Database Session
- [x] Base Model
- [x] Database Initialisation
- [x] User Model
- [x] Organisation Model

---

### Frontend

- [x] Next.js Initialised
- [x] TypeScript
- [x] Tailwind CSS
- [x] Development Server Running

---

# 📡 Available API Endpoints

## Root Endpoint

```
GET /
```

Response

```json
{
  "message": "Panopticon API Running 🚀"
}
```

---

## Health Check

```
GET /api/v1/health
```

Response

```json
{
  "status": "healthy",
  "service": "Panopticon Backend"
}
```

---

# 🗂️ Database Models

Current Models

- User
- Organisation

Upcoming Models

- Account
- Device
- Merchant
- Transaction
- Fraud Case
- Alert
- Investigation

---

# 🛣️ Development Roadmap

## Phase 1 — Foundation ✅

- Backend Structure
- FastAPI
- SQLAlchemy
- Initial Models

---

## Phase 2 — Fraud Domain

- Account Model
- Device Model
- Merchant Model
- Transaction Model
- Fraud Case Model
- Alert Model

---

## Phase 3 — Authentication

- JWT Authentication
- User Roles
- Organisation Management
- RBAC

---

## Phase 4 — Graph Intelligence

- Neo4j Integration
- Graph Builder
- Community Detection
- Graph APIs

---

## Phase 5 — AI Engine

- Graph Neural Networks
- Risk Scoring
- Explainable AI
- Fraud Prediction

---

## Phase 6 — Dashboard

- Authentication UI
- Fraud Monitoring
- Graph Explorer
- Analytics
- Case Management

---

## Phase 7 — Production

- Docker
- CI/CD
- Cloud Deployment
- Monitoring
- Documentation

---

# 🎯 Long-Term Goal

Panopticon aims to become an enterprise platform that enables banks, fintech companies, payment gateways, and digital financial institutions to detect sophisticated fraud networks using graph intelligence and machine learning.

---

# 👨‍💻 Status

**Current Version**

```
v0.1.0-alpha
```

Project Status

```
🟢 Active Development
```

---

# 📄 License

This project is currently under development and is not licensed for public production use.
