import mongoose from 'mongoose';

const PredictionSchema = new mongoose.Schema({
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
  predictionType: {
    type: String,
    required: true,
    enum: ['FAILURE_PROBABILITY', 'ENERGY_ANOMALY', 'QUALITY_DEFECT']
  },
  modelVersion: {
    type: String,
    required: true
  },
  result: {
    probability: Number,
    confidence: Number,
    timeHorizon: String,
    contributingFactors: [{
      feature: String,
      importance: Number,
      value: mongoose.Schema.Types.Mixed
    }]
  },
  recommendations: [{
    action: String,
    priority: String,
    description: String
  }],
  actualOutcome: {
    type: String,
    enum: ['TRUE_POSITIVE', 'FALSE_POSITIVE', 'TRUE_NEGATIVE', 'FALSE_NEGATIVE', 'PENDING'],
    default: 'PENDING'
  },
  verifiedAt: {
    type: Date
  }
});

// Indexes for fast retrieval
PredictionSchema.index({ machineId: 1, timestamp: -1 });
PredictionSchema.index({ predictionType: 1 });

const Prediction = mongoose.model('Prediction', PredictionSchema);

export default Prediction;
