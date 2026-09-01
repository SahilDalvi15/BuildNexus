import mongoose from 'mongoose';

const sparePartSchema = new mongoose.Schema({
    partId: {
        type: String,
        required: true,
        unique: true
    },
    plantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plant',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    compatibleAssets: [{
        type: String,
        ref: 'Machine'
    }],
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    minimumStock: {
        type: Number,
        required: true,
        default: 0
    },
    reservedQuantity: {
        type: Number,
        default: 0
    },
    supplier: {
        type: String
    },
    leadTimeDays: {
        type: Number
    },
    cost: {
        type: Number
    },
    criticality: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM'
    },
    location: {
        type: String
    }
}, {
    timestamps: true
});

sparePartSchema.index({ plantId: 1, partId: 1 });
sparePartSchema.index({ compatibleAssets: 1 });

export default mongoose.model('SparePart', sparePartSchema);
