import express from 'express';
import {
  getMachines,
  getMachineById,
  addMachine,
  updateMachine,
  deleteMachine,
  getMachineKPIs
} from '../controllers/machineController.js';

const router = express.Router();

router.route('/')
  .get(getMachines)
  .post(addMachine);

router.route('/kpis/overall')
  .get(getMachineKPIs);

router.route('/:id')
  .get(getMachineById)
  .put(updateMachine)
  .delete(deleteMachine);

export default router;
