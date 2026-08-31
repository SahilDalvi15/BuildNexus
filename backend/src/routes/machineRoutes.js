import express from 'express';
import {
  getMachines,
  getMachineById,
  addMachine,
  updateMachine,
  deleteMachine,
  getMachineKPIs
} from '../controllers/machineController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMachines)
  .post(protect, addMachine);

router.route('/kpis/overall')
  .get(protect, getMachineKPIs);

router.route('/:id')
  .get(protect, getMachineById)
  .put(protect, updateMachine)
  .delete(protect, deleteMachine);

export default router;
