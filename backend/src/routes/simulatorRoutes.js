import express from 'express';
import { runSimulation, runScenarioSimulation } from '../controllers/simulatorController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/run', restrictTo('ADMIN', 'ENGINEER'), runSimulation);
router.post('/scenario', restrictTo('ADMIN', 'ENGINEER'), runScenarioSimulation);

export default router;
