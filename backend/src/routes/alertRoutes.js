import express from 'express';
import { getAlerts, updateAlertStatus } from '../controllers/alertController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.route('/').get(protect, getAlerts);
router.route('/:id/status').put(protect, updateAlertStatus);

export default router;
