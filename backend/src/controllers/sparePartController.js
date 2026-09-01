import SparePart from '../models/SparePart.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import crypto from 'crypto';

// @desc    Get all spare parts for a plant
// @route   GET /api/parts
// @access  Private
export const getSpareParts = async (req, res) => {
    try {
        const query = {};
        if (req.query.plantId) query.plantId = req.query.plantId;
        if (req.query.machineId) query.compatibleAssets = req.query.machineId;

        const parts = await SparePart.find(query)
            .sort({ name: 1 })
            .populate('compatibleAssets', 'name machineId');

        // Add computed stock status
        const partsWithStatus = parts.map(part => {
            const availableQuantity = part.quantity - part.reservedQuantity;
            let status = 'IN_STOCK';
            
            if (availableQuantity <= 0) {
                status = 'OUT_OF_STOCK';
            } else if (availableQuantity <= part.minimumStock) {
                status = 'LOW_STOCK';
            }

            return {
                ...part.toObject(),
                availableQuantity,
                stockStatus: status
            };
        });

        res.json(partsWithStatus);
    } catch (error) {
        console.error('Error fetching spare parts:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a spare part
// @route   POST /api/parts
// @access  Private
export const createSparePart = async (req, res) => {
    try {
        const {
            plantId, name, compatibleAssets, quantity, minimumStock, 
            supplier, leadTimeDays, cost, criticality, location
        } = req.body;

        const partId = `SP-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        const part = new SparePart({
            partId, plantId, name, compatibleAssets, quantity, minimumStock,
            supplier, leadTimeDays, cost, criticality, location
        });

        const createdPart = await part.save();

        // Log initial receipt transaction if quantity > 0
        if (quantity > 0) {
            await InventoryTransaction.create({
                transactionId: `TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
                partId: createdPart._id,
                type: 'RECEIPT',
                quantity,
                userId: req.user?._id,
                notes: 'Initial stock entry'
            });
        }

        res.status(201).json(createdPart);
    } catch (error) {
        console.error('Error creating spare part:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Perform inventory transaction
// @route   POST /api/parts/:id/transactions
// @access  Private
export const performInventoryTransaction = async (req, res) => {
    try {
        const { type, quantity, workOrderId, notes } = req.body;
        const partId = req.params.id;

        const part = await SparePart.findById(partId);
        if (!part) {
            return res.status(404).json({ message: 'Spare part not found' });
        }

        const transactionQuantity = Math.abs(Number(quantity));
        let qtyChange = 0;
        let reservedChange = 0;

        switch(type) {
            case 'RECEIPT':
                qtyChange = transactionQuantity;
                break;
            case 'ISSUE':
                // Check available quantity
                if (part.quantity - part.reservedQuantity < transactionQuantity) {
                    return res.status(400).json({ message: 'Insufficient unreserved stock' });
                }
                qtyChange = -transactionQuantity;
                break;
            case 'RESERVE':
                if (part.quantity - part.reservedQuantity < transactionQuantity) {
                    return res.status(400).json({ message: 'Insufficient stock to reserve' });
                }
                reservedChange = transactionQuantity;
                break;
            case 'UNRESERVE':
                if (part.reservedQuantity < transactionQuantity) {
                    return res.status(400).json({ message: 'Cannot unreserve more than reserved' });
                }
                reservedChange = -transactionQuantity;
                break;
            case 'ADJUSTMENT':
                // For adjustment, quantity can be positive or negative
                qtyChange = Number(quantity);
                break;
            default:
                return res.status(400).json({ message: 'Invalid transaction type' });
        }

        // Apply changes
        part.quantity += qtyChange;
        part.reservedQuantity += reservedChange;

        await part.save();

        // Create transaction record
        const transaction = await InventoryTransaction.create({
            transactionId: `TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            partId,
            type,
            quantity: type === 'ADJUSTMENT' ? quantity : transactionQuantity,
            workOrderId,
            userId: req.user?._id,
            notes
        });

        res.status(201).json({ part, transaction });
    } catch (error) {
        console.error('Error in inventory transaction:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
