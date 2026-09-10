import express from 'express';
import { getMaterialBatches, getMaterialOptimization } from '../controllers/materialController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/batches').get(protect, getMaterialBatches);
router.route('/optimization').get(protect, getMaterialOptimization);

export default router;
