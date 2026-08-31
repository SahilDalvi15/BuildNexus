# BuildNexus Operations Runbook

This document provides instructions for deploying, operating, and troubleshooting the BuildNexus platform.

## 1. Local Development (Without Docker)
To run the platform locally for development:

1. **Start MongoDB:** Ensure MongoDB is running on `localhost:27017`.
2. **Start Backend (Node.js):**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *Runs on port 5000*
3. **Start ML Services (Python):**
   ```bash
   cd ml-services
   python -m venv venv
   source venv/Scripts/activate # Windows
   pip install -r requirements.txt
   python src/api/app.py
   ```
   *Runs on port 5001*
4. **Start Frontend (React):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Runs on port 5173*

## 2. Production Deployment (Docker Compose)
To deploy the entire stack using Docker:

```bash
docker-compose up --build -d
```
* **Frontend:** http://localhost:80
* **Backend API:** http://localhost:5000
* **ML API:** http://localhost:5001

## 3. Database Seeding
If the database is empty, you can seed it with the synthetic dataset:
```bash
cd backend
npm run seed
```
*Warning: This may overwrite existing machine data.*

## 4. Troubleshooting
* **Symptom:** UI shows "Failed to load machines"
  * **Fix:** Check if backend is running. Check CORS settings in `backend/src/server.js`.
* **Symptom:** ML predictions fail or return 500
  * **Fix:** Ensure the Python ML service is running on port 5001. Check the `ML_SERVICE_URL` environment variable in the backend `.env`.
* **Symptom:** AI Assistant returns 500
  * **Fix:** Verify the `GROQ_API_KEY` is set in the backend `.env` and that you have remaining quota.
