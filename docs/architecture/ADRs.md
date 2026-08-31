# Architecture Decision Records (ADRs)

## ADR-001: Separation of Backend and ML Services
**Date:** 2026-08-30  
**Status:** Accepted  

**Context:** The application requires serving standard web API traffic (CRUD, Auth) as well as heavy machine learning inference.  
**Decision:** We decided to split the backend into two distinct microservices: A Node.js/Express service for the primary API gateway, and a Python/Flask service for ML inference.  
**Consequences:** 
* *Positive:* Python is the native language for scikit-learn/XGBoost, making model loading trivial. Node.js handles async I/O (WebSockets, MongoDB) much more efficiently.
* *Negative:* Increased deployment complexity (requires Docker Compose to orchestrate multiple containers).

## ADR-002: Use of MongoDB for Telemetry Data
**Date:** 2026-08-30  
**Status:** Accepted  

**Context:** Industrial IoT sensors produce massive amounts of time-series data.  
**Decision:** We chose MongoDB (NoSQL) over a traditional relational database (e.g., PostgreSQL).  
**Consequences:** 
* *Positive:* Flexible schemas allow different machines to send different sensor payloads without rigid migrations.
* *Negative:* For true production scale, a dedicated Time-Series Database (TSDB) like InfluxDB might be required, but MongoDB suffices for the MVP prototype.

## ADR-003: JWT for Authentication
**Date:** 2026-08-31  
**Status:** Accepted  

**Context:** We need to secure the platform with Role-Based Access Control (RBAC).  
**Decision:** We implemented stateless JSON Web Tokens (JWT) rather than session-based cookies.  
**Consequences:** 
* *Positive:* Highly scalable, works natively with mobile apps if we build them later, and easy to pass between our Microservices.
* *Negative:* Token revocation is difficult without implementing a centralized token blacklist.
