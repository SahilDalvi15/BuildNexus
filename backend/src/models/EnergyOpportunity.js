import mongoose from 'mongoose';

const EnergyOpportunitySchema = new mongoose.Schema({
  opportunityId: {
    type: String,
    required: true,
    unique: true
  },
  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['IDLE_CONSUMPTION', 'ABNORMAL_SPIKE', 'INEFFICIENT_ASSET', 'PROCESS_DEVIATION'],
    required: true
  },
  baselineKwh: {
    type: Number,
    required: true
  },
  actualKwh: {
    type: Number,
    required: true
  },
  deviationPercent: {
    type: Number,
    required: true
  },
  estimatedEnergySavingsKwh: {
    type: Number,
    required: true
  },
  estimatedCostSavings: {
    type: Number,
    required: true
  },
  estimatedCo2Reduction: {
    type: Number,
    required: true
  },
  confidence: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  evidence: [{
    type: String
  }],
  recommendation: {
    type: String
  },
  status: {
    type: String,
    enum: ['OPEN', 'REVIEWED', 'ACTION_CREATED', 'RESOLVED', 'CLOSED'],
    default: 'OPEN'
  }
}, {
  timestamps: true
});

const EnergyOpportunity = mongoose.model('EnergyOpportunity', EnergyOpportunitySchema);

export default EnergyOpportunity;
