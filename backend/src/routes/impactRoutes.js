import express from 'express';
import { getTopRisks, getImpacts } from '../controllers/impactController.js';

const router = express.Router();

router.route('/top-risks').get(getTopRisks);
router.route('/').get(getImpacts);

export default router;
