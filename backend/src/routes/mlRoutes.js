import express from 'express';
import {
  predictFailure,
  predictAnomaly,
  predictQuality,
  analyzeRootCause
} from '../controllers/mlController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { auditLog } from '../middleware/auditMiddleware.js';
import MLModel from '../models/MLModel.js';

const router = express.Router();

router.post('/predict-failure', protect, predictFailure);
router.post('/predict-anomaly', protect, predictAnomaly);
router.post('/predict-quality', protect, predictQuality);
router.post('/analyze-root-cause', protect, analyzeRootCause);

// MLOps routes
router.post('/models', protect, restrictTo('ADMIN'), auditLog('MLModel'), async (req, res, next) => {
    try {
        const model = await MLModel.create({
            ...req.body,
            promotedBy: req.user._id
        });
        res.locals.createdEntityId = model._id.toString(); // For audit log
        res.status(201).json(model);
    } catch (error) {
        next(error);
    }
});

export default router;
