import express from 'express';
import {
  getLatestReadings,
  getSensorHistory,
  getLatestReadingForMachine,
  ingestTelemetry,
  bulkIngest
} from '../controllers/sensorController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/ingest', protect, restrictTo('EDGE_GATEWAY', 'ADMIN'), ingestTelemetry);
router.post('/bulk-ingest', protect, restrictTo('EDGE_GATEWAY', 'ADMIN'), bulkIngest);

router.get('/latest', protect, getLatestReadings);
router.get('/:machineId', protect, getSensorHistory);
router.get('/:machineId/latest', protect, getLatestReadingForMachine);

export default router;
