import mongoose from 'mongoose';

const productionBatchSchema = new mongoose.Schema({
    batchId: {
        type: String,
        required: true,
        unique: true
    },
    plantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plant',
        required: true
    },
    lineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductionLine'
    },
    productType: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'ABORTED'],
        default: 'PLANNED'
    },
    plannedQuantity: {
        type: Number,
        required: true
    },
    actualQuantity: {
        type: Number,
        default: 0
    },
    goodQuantity: {
        type: Number,
        default: 0
    },
    scrapQuantity: {
        type: Number,
        default: 0
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    rawMaterials: [{
        materialId: String,
        lotNumber: String,
        supplier: String
    }],
    operatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

productionBatchSchema.index({ plantId: 1, status: 1 });
productionBatchSchema.index({ startTime: -1 });

export default mongoose.model('ProductionBatch', productionBatchSchema);
