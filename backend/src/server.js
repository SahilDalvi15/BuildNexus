import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

import machineRoutes from './routes/machineRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';
import authRoutes from './routes/authRoutes.js';
import energyRoutes from './routes/energyRoutes.js';
import mlRoutes from './routes/mlRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import workOrderRoutes from './routes/workOrderRoutes.js';
import sparePartRoutes from './routes/sparePartRoutes.js';
import sustainabilityRoutes from './routes/sustainabilityRoutes.js';
import qualityRoutes from './routes/qualityRoutes.js';
import digitalTwinRoutes from './routes/digitalTwinRoutes.js';
import { initSocket } from './services/socketService.js';
import { startIngestionWorker } from './services/ingestionWorker.js';
import http from 'http';

dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Init Socket.io
initSocket(server);

// Start Background Workers
startIngestionWorker();

// Middleware
app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'BuildNexus API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/parts', sparePartRoutes);
app.use('/api/sustainability', sustainabilityRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/digital-twin', digitalTwinRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
