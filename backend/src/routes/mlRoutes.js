import express from 'express';
import {
  predictFailure,
  predictAnomaly,
  predictQuality
} from '../controllers/mlController.js';

const router = express.Router();

router.post('/predict-failure', predictFailure);
router.post('/predict-anomaly', predictAnomaly);
router.post('/predict-quality', predictQuality);

export default router;
