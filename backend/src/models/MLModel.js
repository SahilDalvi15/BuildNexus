import mongoose from 'mongoose';

const mlModelSchema = new mongoose.Schema({
    modelId: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['FAILURE_PREDICTION', 'ENERGY_ANOMALY', 'QUALITY_SCORING'],
        required: true
    },
    version: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['TRAINING', 'STAGING', 'PRODUCTION', 'DEPRECATED'],
        default: 'TRAINING'
    },
    trainedAt: {
        type: Date
    },
    metrics: {
        accuracy: Number,
        f1Score: Number,
        precision: Number,
        recall: Number
    },
    hyperparameters: {
        type: mongoose.Schema.Types.Mixed
    },
    promotedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

mlModelSchema.index({ type: 1, status: 1 });

export default mongoose.model('MLModel', mlModelSchema);
