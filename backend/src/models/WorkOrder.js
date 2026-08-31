import mongoose from 'mongoose';

const workOrderSchema = new mongoose.Schema({
    workOrderId: {
        type: String,
        required: true,
        unique: true
    },
    plantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plant',
        required: true
    },
    machineId: {
        type: String,
        ref: 'Machine',
        required: true
    },
    issue: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM'
    },
    sourceAlertId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alert'
    },
    recommendedAction: {
        type: String
    },
    assignedTeam: {
        type: String
    },
    assignedPerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    requiredParts: [{
        partId: String, // Or reference to a Part model later
        quantity: Number
    }],
    estimatedDurationHours: {
        type: Number
    },
    actualDurationHours: {
        type: Number
    },
    plannedStart: {
        type: Date
    },
    actualStart: {
        type: Date
    },
    completionTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_PART', 'COMPLETED', 'VERIFIED', 'CLOSED'],
        default: 'OPEN'
    },
    notes: {
        type: String
    },
    verification: {
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        verificationNotes: String,
        verifiedAt: Date
    },
    auditHistory: [{
        action: String,
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        reason: String
    }]
}, {
    timestamps: true
});

// Indexes for querying work orders
workOrderSchema.index({ plantId: 1, status: 1 });
workOrderSchema.index({ machineId: 1 });
workOrderSchema.index({ assignedPerson: 1 });

export default mongoose.model('WorkOrder', workOrderSchema);
