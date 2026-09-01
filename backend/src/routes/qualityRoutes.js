import express from 'express';
import {
    getBatchTraceability,
    recordQualityResult
} from '../controllers/qualityController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/traceability/:batchId', getBatchTraceability);
router.post('/results', restrictTo('ADMIN', 'ENGINEER', 'OPERATOR'), recordQualityResult);

export default router;
