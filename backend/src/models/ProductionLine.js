import mongoose from 'mongoose';

const productionLineSchema = new mongoose.Schema({
    lineId: {
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
    area: {
        type: String
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
        default: 'ACTIVE'
    }
}, {
    timestamps: true
});

productionLineSchema.index({ plantId: 1, lineId: 1 });

export default mongoose.model('ProductionLine', productionLineSchema);
