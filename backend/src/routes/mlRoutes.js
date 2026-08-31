import express from 'express';
import {
  predictFailure,
  predictAnomaly,
  predictQuality
} from '../controllers/mlController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/predict-failure', protect, predictFailure);
router.post('/predict-anomaly', protect, predictAnomaly);
router.post('/predict-quality', protect, predictQuality);

export default router;
