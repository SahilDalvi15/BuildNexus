import mongoose from 'mongoose';

const telemetryQueueSchema = new mongoose.Schema({
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'FAILED'],
    default: 'PENDING'
  },
  attempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '1d' // Automatically delete records older than 1 day to prevent unbounded growth of the queue if something breaks
  }
});

// Index to quickly find pending jobs, sorted by oldest first
telemetryQueueSchema.index({ status: 1, createdAt: 1 });

const TelemetryQueue = mongoose.model('TelemetryQueue', telemetryQueueSchema);
export default TelemetryQueue;
