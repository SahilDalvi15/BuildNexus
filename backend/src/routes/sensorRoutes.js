import express from 'express';
import {
  getLatestReadings,
  getSensorHistory,
  getLatestReadingForMachine
} from '../controllers/sensorController.js';

const router = express.Router();

router.get('/latest', getLatestReadings);
router.get('/:machineId', getSensorHistory);
router.get('/:machineId/latest', getLatestReadingForMachine);

export default router;
