import express from 'express';
import { getSustainabilityMetrics } from '../controllers/sustainabilityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getSustainabilityMetrics);

export default router;
