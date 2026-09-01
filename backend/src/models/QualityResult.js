import mongoose from 'mongoose';

const qualityResultSchema = new mongoose.Schema({
    resultId: {
        type: String,
        required: true,
        unique: true
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductionBatch',
        required: true
    },
    machineId: {
        type: String,
        ref: 'Machine'
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    status: {
        type: String,
        enum: ['PASS', 'FAIL', 'REWORK'],
        required: true
    },
    defectCategory: {
        type: String
    },
    measurements: {
        type: Map,
        of: Number
    },
    images: [{
        url: String,
        description: String
    }],
    inspectorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    aiConfidenceScore: {
        type: Number // If inspected by ML Quality Intelligence
    }
}, {
    timestamps: true
});

qualityResultSchema.index({ batchId: 1 });
qualityResultSchema.index({ status: 1 });
qualityResultSchema.index({ defectCategory: 1 });

export default mongoose.model('QualityResult', qualityResultSchema);
