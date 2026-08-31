# Threat Model

## 1. System Boundaries
The platform consists of three main boundaries:
* **Frontend (React):** Runs in the user's browser. Considered untrusted.
* **Backend API (Node.js):** Primary gateway. Enforces authentication and data validation.
* **ML Service (Python):** Internal microservice. Should only be accessible via the Backend API.

## 2. Identified Threats & Mitigations

### T1: Unauthorized Access to Dashboard and Telemetry
* **Threat:** A malicious actor attempts to view factory data or machine statuses.
* **Mitigation:** Implemented JSON Web Tokens (JWT) via `AuthContext.jsx`. The backend uses a `protect` middleware on all `/api/machines`, `/api/energy`, `/api/sensors`, and `/api/ml` endpoints. The frontend uses a `ProtectedRoute` wrapper to redirect unauthenticated users to `/login`.

### T2: Prompt Injection in AI Assistant
* **Threat:** A user attempts to manipulate the LLM via the `/api/ai/ask` endpoint into returning malicious scripts, ignoring instructions, or revealing system prompts.
* **Mitigation:** The AI prompt is strictly grounded to factory data context. However, full sanitization of user input is an ongoing requirement. (Recommendation: Implement an input sanitizer middleware).

### T3: ML Service Exploitation
* **Threat:** An attacker sends malformed payloads directly to the ML models (e.g., extremely large numbers causing float overflows or DoS).
* **Mitigation:** The ML service does not accept public traffic. It is bound to an internal network in Docker, and all requests are proxied and validated by the Node.js backend first.

### T4: Database Injection
* **Threat:** NoSQL injection via search fields or login forms.
* **Mitigation:** Mongoose ODM is used for all queries, inherently escaping raw strings.

## 3. Pending Security Enhancements
* Implement rate limiting (e.g., `express-rate-limit`) to prevent brute-forcing the login endpoint.
* Implement CSRF tokens if transitioning from LocalStorage JWTs to HTTP-only cookies.
