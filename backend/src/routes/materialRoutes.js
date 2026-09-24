import express from 'express';
import { getMaterialBatches, getMaterialOptimization, simulateCulletMix } from '../controllers/materialController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/batches').get(protect, getMaterialBatches);
router.route('/optimization').get(protect, getMaterialOptimization);
router.route('/cullet-optimizer').post(protect, simulateCulletMix);

export default router;
