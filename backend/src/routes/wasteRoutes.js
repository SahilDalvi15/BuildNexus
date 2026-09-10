import express from 'express';
import { getWasteStreams, getWasteOpportunities } from '../controllers/wasteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/streams').get(protect, getWasteStreams);
router.route('/opportunities').get(protect, getWasteOpportunities);

export default router;
