import mongoose from 'mongoose';

const edgeGatewaySchema = new mongoose.Schema({
    gatewayId: {
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
    status: {
        type: String,
        enum: ['ONLINE', 'OFFLINE', 'MAINTENANCE'],
        default: 'OFFLINE'
    },
    lastHeartbeat: {
        type: Date
    },
    ipAddress: {
        type: String
    },
    connectedMachines: [{
        type: String,
        ref: 'Machine'
    }],
    storeAndForwardStatus: {
        isSyncing: { type: Boolean, default: false },
        lastSync: { type: Date },
        pendingMessagesCount: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

edgeGatewaySchema.index({ plantId: 1, status: 1 });
edgeGatewaySchema.index({ gatewayId: 1 });

export default mongoose.model('EdgeGateway', edgeGatewaySchema);
