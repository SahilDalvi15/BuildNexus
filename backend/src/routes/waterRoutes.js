import express from 'express';
import { getWaterSummary } from '../controllers/waterController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/summary').get(protect, getWaterSummary);

export default router;
