import express from 'express';
import { getDigitalTwinLayout } from '../controllers/digitalTwinController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/layout/:plantId', getDigitalTwinLayout);

export default router;
