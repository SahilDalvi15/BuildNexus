import express from 'express';
import { getOptimizationScenarios, getDecarbRoadmap } from '../controllers/optimizerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/scenarios').get(protect, getOptimizationScenarios);
router.route('/decarb-roadmap').post(protect, getDecarbRoadmap);

export default router;
