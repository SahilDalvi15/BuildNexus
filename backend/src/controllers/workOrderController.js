import WorkOrder from '../models/WorkOrder.js';
import Alert from '../models/Alert.js';
import crypto from 'crypto';

// @desc    Get all work orders
// @route   GET /api/work-orders
// @access  Private
export const getWorkOrders = async (req, res) => {
    try {
        const query = {};
        
        if (req.query.plantId) query.plantId = req.query.plantId;
        if (req.query.status) query.status = req.query.status;
        if (req.query.machineId) query.machineId = req.query.machineId;

        const workOrders = await WorkOrder.find(query)
            .sort({ createdAt: -1 })
            .populate('assignedPerson', 'username email')
            .populate('sourceAlertId', 'message type severity');

        res.json(workOrders);
    } catch (error) {
        console.error('Error fetching work orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single work order
// @route   GET /api/work-orders/:id
// @access  Private
export const getWorkOrderById = async (req, res) => {
    try {
        const workOrder = await WorkOrder.findById(req.params.id)
            .populate('assignedPerson', 'username email')
            .populate('sourceAlertId')
            .populate('auditHistory.actor', 'username');

        if (!workOrder) {
            return res.status(404).json({ message: 'Work order not found' });
        }

        res.json(workOrder);
    } catch (error) {
        console.error('Error fetching work order:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new work order
// @route   POST /api/work-orders
// @access  Private (Admin/Engineer)
export const createWorkOrder = async (req, res) => {
    try {
        const {
            plantId,
            machineId,
            issue,
            priority,
            sourceAlertId,
            recommendedAction,
            assignedTeam,
            assignedPerson
        } = req.body;

        const workOrderId = `WO-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        const workOrder = new WorkOrder({
            workOrderId,
            plantId,
            machineId,
            issue,
            priority,
            sourceAlertId,
            recommendedAction,
            assignedTeam,
            assignedPerson,
            auditHistory: [{
                action: 'CREATED',
                actor: req.user?._id,
                reason: 'Initial creation'
            }]
        });

        const createdWorkOrder = await workOrder.save();

        // If created from an alert, link back to the alert
        if (sourceAlertId) {
            await Alert.findByIdAndUpdate(sourceAlertId, { 
                workOrderId: createdWorkOrder._id,
                status: 'IN_PROGRESS' 
            });
        }

        res.status(201).json(createdWorkOrder);
    } catch (error) {
        console.error('Error creating work order:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update work order status
// @route   PATCH /api/work-orders/:id/status
// @access  Private
export const updateWorkOrderStatus = async (req, res) => {
    try {
        const { status, notes, reason } = req.body;
        
        const workOrder = await WorkOrder.findById(req.params.id);
        
        if (!workOrder) {
            return res.status(404).json({ message: 'Work order not found' });
        }

        workOrder.status = status;
        if (notes) {
            workOrder.notes = notes;
        }

        if (status === 'COMPLETED') {
            workOrder.completionTime = new Date();
        } else if (status === 'IN_PROGRESS' && !workOrder.actualStart) {
            workOrder.actualStart = new Date();
        }

        workOrder.auditHistory.push({
            action: `STATUS_CHANGED_TO_${status}`,
            actor: req.user?._id,
            reason: reason || 'Status update'
        });

        const updatedWorkOrder = await workOrder.save();

        res.json(updatedWorkOrder);
    } catch (error) {
        console.error('Error updating work order status:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
