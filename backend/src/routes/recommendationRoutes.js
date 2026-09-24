import express from 'express';
import { getRecommendations, updateRecommendationStatus } from '../controllers/recommendationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.route('/').get(protect, getRecommendations);
router.route('/:id/status').patch(protect, updateRecommendationStatus);

export default router;
