import express from 'express';
import { getDecarbRoadmap } from '../controllers/decarbController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getDecarbRoadmap);

export default router;
