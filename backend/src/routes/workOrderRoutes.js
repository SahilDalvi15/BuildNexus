import express from 'express';
import {
    getWorkOrders,
    getWorkOrderById,
    createWorkOrder,
    updateWorkOrderStatus
} from '../controllers/workOrderController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Require authentication for all routes
router.use(protect);

router.route('/')
    .get(getWorkOrders)
    .post(restrictTo('ADMIN', 'ENGINEER'), createWorkOrder);

router.route('/:id')
    .get(getWorkOrderById);

router.route('/:id/status')
    .patch(updateWorkOrderStatus);

export default router;
