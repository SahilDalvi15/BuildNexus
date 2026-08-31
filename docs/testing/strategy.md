# Testing Strategy

This document outlines the testing methodologies used to validate the BuildNexus platform.

## 1. End-to-End (E2E) Scenarios
To validate the critical paths of the application, the following E2E scenarios should be tested:
* **Authentication Flow:** Verify that an unauthenticated user is redirected to `/login`, and upon successful login, is granted access to the dashboard.
* **ML Integration Flow:** Ensure that navigating to the Quality or Maintenance dashboards correctly queries the Node API, which in turn queries the Python ML API, returning a valid JSON response containing risk probabilities.

## 2. Degraded Service Testing
The platform is designed to handle microservice failures gracefully.
* **ML Service Offline:** If the Python ML container goes down, the Node.js backend should catch the connection error and return a handled error message or fallback data to the frontend, preventing a UI crash. (Currently handled via global Error Boundaries in React).

## 3. Contract Testing
* **Schema Validation:** The Python ML service expects exact keys (e.g., `temperature`, `vibration`) from the Node API. Any mismatch in feature naming between the two services will cause inference failures. Data consistency is enforced in the `mlController.js` mapping layer.

## 4. Future Test Automation
Due to prototype constraints, automated tests (e.g., Jest for Node, PyTest for Python) have not been fully implemented. In a production scenario, we recommend:
1. **PyTest:** To assert the ML models output expected shapes and handle `NaN` inputs.
2. **Jest / Supertest:** To assert the Node API routes return 200/401 correctly based on JWT presence.
3. **Cypress:** For UI interactions on the React frontend.
