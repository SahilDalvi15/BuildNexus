import express from 'express';
import {
  getOverallEnergyMetrics,
  getMachineEnergyMetrics
} from '../controllers/energyController.js';

const router = express.Router();

router.route('/overall')
  .get(getOverallEnergyMetrics);

router.route('/:machineId')
  .get(getMachineEnergyMetrics);

export default router;
