import express from 'express';
import {
    getSpareParts,
    createSparePart,
    performInventoryTransaction
} from '../controllers/sparePartController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getSpareParts)
    .post(restrictTo('ADMIN', 'ENGINEER'), createSparePart);

router.route('/:id/transactions')
    .post(restrictTo('ADMIN', 'ENGINEER', 'OPERATOR'), performInventoryTransaction);

export default router;
