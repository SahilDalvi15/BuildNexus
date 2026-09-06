import mongoose from 'mongoose';

const ImpactRecordSchema = new mongoose.Schema({
  impactId: {
    type: String,
    required: true,
    unique: true
  },
  eventId: {
    type: String,
    required: true
  },
  organizationId: {
    type: String,
    default: 'ORG-MAIN'
  },
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant'
  },
  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['MACHINE_DEGRADATION', 'ENERGY_ANOMALY', 'QUALITY_DEFECT', 'PRODUCTION_STOPPAGE']
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  classification: {
    productionImpact: { type: String, enum: ['MEASURED', 'CALCULATED', 'PREDICTED', 'SIMULATED', 'ESTIMATED'], default: 'ESTIMATED' },
    energyImpact: { type: String, enum: ['MEASURED', 'CALCULATED', 'PREDICTED', 'SIMULATED', 'ESTIMATED'], default: 'ESTIMATED' },
    carbonImpact: { type: String, enum: ['MEASURED', 'CALCULATED', 'PREDICTED', 'SIMULATED', 'ESTIMATED'], default: 'ESTIMATED' },
    costImpact: { type: String, enum: ['MEASURED', 'CALCULATED', 'PREDICTED', 'SIMULATED', 'ESTIMATED'], default: 'ESTIMATED' }
  },
  
  // Specific Impact Metrics
  failureProbability: { type: Number, min: 0, max: 1 },
  estimatedDowntimeHours: { type: Number, default: 0 },
  verifiedDowntimeHours: { type: Number },
  
  estimatedProductionLossUnits: { type: Number, default: 0 },
  verifiedProductionLossUnits: { type: Number },
  
  energyDeviationPercent: { type: Number, default: 0 },
  estimatedExcessEnergyKwh: { type: Number, default: 0 },
  verifiedExcessEnergyKwh: { type: Number },
  
  estimatedCostImpact: { type: Number, default: 0 },
  verifiedCostImpact: { type: Number },
  
  estimatedCarbonImpactTCO2e: { type: Number, default: 0 },
  verifiedCarbonImpactTCO2e: { type: Number },

  recommendation: {
    type: { type: String, enum: ['SCHEDULE_MAINTENANCE', 'ADJUST_PARAMETERS', 'INSPECT_EQUIPMENT', 'NO_ACTION'] },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] }
  },

  evidence: [{
    type: String // e.g., "Sensor trends indicate 40% vibration increase over 24h"
  }],
  
  assumptions: [{
    type: String // e.g., "Cost based on average historical downtime cost of $500/hr"
  }],

  status: {
    type: String,
    enum: ['OPEN', 'REVIEWED', 'ACTION_CREATED', 'RESOLVED', 'CLOSED'],
    default: 'OPEN'
  }
}, {
  timestamps: true
});

const ImpactRecord = mongoose.model('ImpactRecord', ImpactRecordSchema);

export default ImpactRecord;
