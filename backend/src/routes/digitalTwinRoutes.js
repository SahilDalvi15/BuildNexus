import express from 'express';
import { getDigitalTwinLayout, simulateFurnaceFuel } from '../controllers/digitalTwinController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/layout/:plantId', getDigitalTwinLayout);
router.post('/furnace-simulator', simulateFurnaceFuel);

export default router;
