import express from 'express';
import {
  getOverallEnergyMetrics,
  getMachineEnergyMetrics
} from '../controllers/energyController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/overall')
  .get(protect, getOverallEnergyMetrics);

router.route('/:machineId')
  .get(protect, getMachineEnergyMetrics);

export default router;
