import express from 'express';
import { getCrossPlantBenchmark } from '../controllers/benchmarkController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/compare').get(protect, getCrossPlantBenchmark);

export default router;
