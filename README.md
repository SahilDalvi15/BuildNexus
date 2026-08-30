# 🏭 BuildNexus

**BuildNexus** is a full-stack, AI-powered Smart Factory Ecosystem. It integrates real-time IoT sensor data, Predictive Maintenance (Machine Learning), and a Gemini-powered AI Assistant (RAG/Grounding) to monitor, predict, and optimize industrial operations.

---

## 🌟 Key Features
- **Live Factory Dashboard**: Real-time WebSockets (`socket.io`) stream KPI metrics (OEE, Energy, Availability).
- **Predictive Maintenance**: 
  - 🔮 XGBoost: Failure Risk Prediction
  - 📈 Random Forest: Quality Score Prediction
  - ⚡ Isolation Forest: Energy Anomaly Detection
- **Energy Intelligence**: Track live kWh consumption, USD cost impact, and CO2 emissions.
- **AI Chat Assistant**: Ask a Groq LLM agent grounded in live factory context about your machines.

---

## 🏗️ Architecture Stack
1. **Frontend**: React + Vite, Recharts, Lucide Icons.
2. **Backend API**: Node.js + Express, MongoDB, Socket.io, `groq-sdk`.
3. **ML Microservice**: Python + Flask, Scikit-Learn, XGBoost, Pandas.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB (Running locally on `mongodb://localhost:27017` or via Atlas)
- Groq API Key

### 1. Installation

Install all dependencies across the entire monorepo:
```bash
npm run install:all
```

### 2. Environment Variables

Create your `.env` files using the provided templates:
- `backend/.env` (Copy from `backend/.env.example` and add your `GROQ_API_KEY`)
- `frontend/.env` (Copy from `frontend/.env.example`)

### 3. Database Seeding & Model Training

Before booting, you must train the ML models and seed the initial MongoDB data:
```bash
cd ml-services
python src/data_generator/generator.py
python src/models/train_predictive_maintenance.py
python src/models/train_quality_prediction.py
python src/models/train_energy_anomaly.py
```

### 4. Run the Ecosystem

Thanks to `concurrently`, you can boot the Node Server (Port 5000), Flask ML Service (Port 5001), and Vite Frontend (Port 5173) simultaneously from the root:
```bash
npm run dev
```

### 5. Open the App
Visit `http://localhost:5173` in your browser.

---

*Built with passion for Industry 4.0.*
