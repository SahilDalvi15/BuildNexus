import express from 'express';
import { getSuppliers, getSupplierCarbonIntel } from '../controllers/supplierController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.route('/').get(protect, getSuppliers);
router.route('/carbon').get(protect, getSupplierCarbonIntel);

export default router;
