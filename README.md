# 🛡️ Panopticon

> **Enterprise Financial Fraud Detection and Intelligence Platform**

Panopticon is a full-stack fraud intelligence platform designed to detect, analyze, and investigate suspicious financial activity.

The platform combines transaction monitoring, risk scoring, authentication, role-based access control, graph intelligence, and machine learning into a unified fraud investigation system.

The long-term objective is to move beyond isolated transaction-level fraud detection and understand the **relationships between accounts, users, devices, merchants, transactions, and other financial entities**.

---

# 🚀 Project Status

**Version:** `v0.3.0-alpha`

**Status:** 🟢 Active Development

### Current Phase

> **Fraud Detection Foundation + Full-Stack Integration**

The core backend fraud detection foundation is operational, while the frontend dashboard and advanced intelligence capabilities continue to be developed.

### Completed

- ✅ Full-stack project architecture
- ✅ Next.js frontend
- ✅ FastAPI backend
- ✅ SQLAlchemy database layer
- ✅ Organization model
- ✅ User model
- ✅ Account model
- ✅ Merchant model
- ✅ Device model
- ✅ Transaction model
- ✅ Database relationships
- ✅ Development database seeding
- ✅ JWT authentication
- ✅ Password hashing
- ✅ Password verification
- ✅ Role-Based Access Control
- ✅ Protected API endpoints
- ✅ Transaction APIs
- ✅ Transaction filtering
- ✅ Transaction pagination
- ✅ Rule-based fraud risk scoring
- ✅ LOW / MEDIUM / HIGH risk classification
- ✅ Suspicious transaction detection
- ✅ Graph API foundation
- ✅ Graph node details API
- ✅ Frontend authentication flow
- ✅ Production frontend deployment foundation
- ✅ Production backend deployment foundation

### In Progress

- 🚧 Dashboard API
- 🚧 Frontend-backend data integration
- 🚧 Interactive fraud graph
- 🚧 Real-time monitoring
- 🚧 Fraud analytics
- 🚧 Alert management

### Planned

- ⏳ Neo4j graph integration
- ⏳ Advanced Graph Intelligence
- ⏳ Machine Learning fraud detection
- ⏳ Graph Neural Networks
- ⏳ Explainable AI
- ⏳ Fraud ring detection
- ⏳ Case management
- ⏳ Enterprise infrastructure

---

# 🎯 What Is Panopticon?

Traditional fraud detection systems often evaluate transactions independently.

Panopticon is designed around a different idea:

> **Fraud is often a relationship problem, not just a transaction problem.**


For example:

```text
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Account    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Transaction  │
                    └───┬────┬─────┘
                        │    │
             ┌──────────┘    └──────────┐
             ▼                          ▼
      ┌────────────┐              ┌────────────┐
      │  Merchant  │              │   Device   │
      └────────────┘              └──────┬─────┘
                                         │
                                         ▼
                                   ┌────────────┐
                                   │ IP Address │
                                   └────────────┘