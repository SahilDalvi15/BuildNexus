import express from 'express';
import {
  getMachines,
  getMachineById,
  addMachine,
  updateMachine,
  deleteMachine
} from '../controllers/machineController.js';

const router = express.Router();

router.route('/')
  .get(getMachines)
  .post(addMachine);

router.route('/:id')
  .get(getMachineById)
  .put(updateMachine)
  .delete(deleteMachine);

export default router;
