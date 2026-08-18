# 🛡️ Panopticon

> Enterprise Financial Fraud Detection and Intelligence Platform.

Panopticon is a fraud intelligence platform designed to help identify suspicious financial activity through transaction monitoring, risk scoring, authentication, role-based access control, and future Graph Intelligence and AI capabilities.

The platform is being developed as a full-stack application with a Next.js frontend and FastAPI backend.

Instead of treating every transaction as an isolated event, the long-term goal of Panopticon is to analyze relationships between accounts, users, devices, merchants, IP addresses, and transactions to identify suspicious patterns and coordinated fraud networks.

---

# 🚀 Current Status

**Version:** `v0.3.0-alpha`

**Status:** 🟢 Active Development

**Current Phase:**
> Backend Fraud Detection Foundation completed. Currently preparing frontend and backend integration.

### Current Progress

- ✅ Core backend architecture
- ✅ Database models and relationships
- ✅ JWT authentication
- ✅ Role-Based Access Control
- ✅ Transaction APIs
- ✅ Automatic rule-based risk scoring
- ✅ LOW / MEDIUM / HIGH risk classification
- ✅ Suspicious transaction detection
- ✅ Transaction filtering and pagination
- 🚧 Dashboard API
- 🚧 Frontend-backend integration
- ⏳ Graph Intelligence
- ⏳ AI / ML fraud detection

---

# 📌 Vision

Panopticon aims to become an enterprise fraud intelligence platform capable of:

- Real-Time Transaction Monitoring
- Fraud Detection
- Risk Scoring
- Suspicious Transaction Detection
- Fraud Ring Detection
- Graph Intelligence
- Graph Neural Networks
- Explainable AI
- Interactive Investigation Dashboard
- Fraud Alerts
- Case Management
- Analytics
- Enterprise APIs

---

# 🏗️ Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Three.js *(planned for advanced visualisation)*

## Backend

- FastAPI
- Python
- SQLAlchemy
- Pydantic
- JWT Authentication
- Passlib / Bcrypt
- SQLite *(Development Database)*

## Planned Infrastructure

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
│
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── graph/
│   │   ├── ml/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── tests/
│
└── README.md