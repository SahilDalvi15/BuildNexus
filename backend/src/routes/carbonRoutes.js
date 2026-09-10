import express from 'express';
import { getCarbonSummary, getEmissionFactors } from '../controllers/carbonController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/summary').get(protect, getCarbonSummary);
router.route('/factors').get(protect, getEmissionFactors);

export default router;
