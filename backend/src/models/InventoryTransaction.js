import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    partId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SparePart',
        required: true
    },
    type: {
        type: String,
        enum: ['RECEIPT', 'ISSUE', 'RESERVE', 'UNRESERVE', 'ADJUSTMENT'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    workOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkOrder'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

inventoryTransactionSchema.index({ partId: 1, createdAt: -1 });

export default mongoose.model('InventoryTransaction', inventoryTransactionSchema);
