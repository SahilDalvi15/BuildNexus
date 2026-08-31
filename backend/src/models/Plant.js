import mongoose from 'mongoose';

const plantSchema = new mongoose.Schema({
    plantId: {
        type: String,
        required: true,
        unique: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: String
    },
    timezone: {
        type: String,
        default: 'UTC'
    },
    operatingCalendar: {
        type: Map,
        of: String
    },
    energyConfiguration: {
        tariff: Number,
        currency: String
    },
    co2Factors: {
        value: Number,
        unit: String,
        source: String,
        effectiveDate: Date
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'MAINTENANCE', 'CLOSED'],
        default: 'ACTIVE'
    }
}, {
    timestamps: true
});

// Compound index for fast lookup by org
plantSchema.index({ organizationId: 1, plantId: 1 });

export default mongoose.model('Plant', plantSchema);
