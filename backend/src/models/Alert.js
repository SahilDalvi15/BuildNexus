import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
  machineId: {
    type: String,
    required: true,
    ref: 'Machine'
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    required: true,
    enum: ['CRITICAL', 'WARNING', 'INFO']
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: Number, // e.g., 1 (High) to 3 (Low)
    default: 2
  },
  status: {
    type: String,
    enum: ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'],
    default: 'NEW'
  },
  resolvedAt: {
    type: Date
  },
  assignedTo: {
    type: String, // could reference User username or email
    ref: 'User'
  },
  predictionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prediction'
  }
});

// Indexes for alert listing and filtering
AlertSchema.index({ timestamp: -1 });
AlertSchema.index({ status: 1 });

const Alert = mongoose.model('Alert', AlertSchema);

export default Alert;
