import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        index: true
    },
    entityType: {
        type: String,
        required: true,
        index: true
    },
    entityId: {
        type: String,
        required: true
    },
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    actorRole: {
        type: String
    },
    changes: {
        type: mongoose.Schema.Types.Mixed // Stores before/after payload
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true,
    capped: { size: 1024 * 1024 * 50, max: 100000 } // Max 50MB or 100k logs
});

// Create compound index for fast querying
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
