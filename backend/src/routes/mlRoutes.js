import express from 'express';
import {
  predictFailure,
  predictAnomaly,
  predictQuality,
  analyzeRootCause
} from '../controllers/mlController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/predict-failure', protect, predictFailure);
router.post('/predict-anomaly', protect, predictAnomaly);
router.post('/predict-quality', protect, predictQuality);
router.post('/analyze-root-cause', protect, analyzeRootCause);

export default router;
