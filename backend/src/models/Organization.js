import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
    organizationId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    industry: {
        type: String
    },
    contactEmail: {
        type: String
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
        default: 'ACTIVE'
    },
    settings: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

export default mongoose.model('Organization', organizationSchema);
