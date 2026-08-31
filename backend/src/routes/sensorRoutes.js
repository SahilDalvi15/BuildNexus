import express from 'express';
import {
  getLatestReadings,
  getSensorHistory,
  getLatestReadingForMachine
} from '../controllers/sensorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/latest', protect, getLatestReadings);
router.get('/:machineId', protect, getSensorHistory);
router.get('/:machineId/latest', protect, getLatestReadingForMachine);

export default router;
