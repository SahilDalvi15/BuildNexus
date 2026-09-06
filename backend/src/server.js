import cluster from 'cluster';
import os from 'os';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { trackMetrics, getMetrics } from './controllers/metricsController.js';

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
import simulatorRoutes from './routes/simulatorRoutes.js';
import { initSocket } from './services/socketService.js';
import { startIngestionWorker } from './services/ingestionWorker.js';
import http from 'http';

dotenv.config();

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  console.log(`Forking ${numCPUs} API workers for enterprise scaling...`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Graceful worker respawning
  cluster.on('exit', (worker, code, signal) => {
    console.warn(`Worker ${worker.process.pid} died (Code: ${code}). Respawning...`);
    cluster.fork();
  });
} else {
  // Worker Process - Connect to database
  connectDB();

  const app = express();
  const server = http.createServer(app);

  // Init Socket.io
  initSocket(server);

  // Start Background Workers only on the first worker (or implement distributed locking)
  // For simplicity, we just let each worker run its own ingestion loop reading from Mongo queue
  startIngestionWorker();

  // Middleware
  // Security Headers
  app.use(helmet());

  // Global Rate Limiter: 1000 requests per 15 minutes per IP
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });
  app.use(globalLimiter);

  app.use(cors());
  app.use(express.json());

  // Prometheus Metrics Tracking Middleware
  app.use(trackMetrics);

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: `BuildNexus API is running on worker ${process.pid}`,
      timestamp: new Date().toISOString()
    });
  });

  // DevOps Metrics Endpoint
  app.get('/api/metrics', getMetrics);

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
  app.use('/api/simulator', simulatorRoutes);

  // Error Handling Middleware
  app.use(notFound);
  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${PORT}`);
  });
}
