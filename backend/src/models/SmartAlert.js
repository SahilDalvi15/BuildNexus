import mongoose from 'mongoose';

const SmartAlertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true },
  machineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // Base components for priority
  severityLevel: { type: Number, min: 1, max: 10, default: 5 },
  failureProbability: { type: Number, min: 0, max: 1, default: 0 },
  assetCriticality: { type: Number, min: 1, max: 10, default: 5 },
  productionImpactFactor: { type: Number, min: 0, max: 10, default: 0 },
  energyImpactFactor: { type: Number, min: 0, max: 10, default: 0 },
  carbonImpactFactor: { type: Number, min: 0, max: 10, default: 0 },
  qualityImpactFactor: { type: Number, min: 0, max: 10, default: 0 },
  urgencyFactor: { type: Number, min: 1, max: 10, default: 5 },

  // Calculated final priority score (0-100)
  priorityScore: { type: Number, required: true },
  
  // Explanation of priority
  priorityExplanation: [{ type: String }],

  status: { type: String, enum: ['NEW', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'], default: 'NEW' },
  type: { type: String, enum: ['PREDICTIVE_MAINTENANCE', 'ENERGY_ANOMALY', 'QUALITY_RISK', 'RESOURCE_DEVIATION', 'SYSTEM'], default: 'SYSTEM' }
}, { timestamps: true });

const SmartAlert = mongoose.model('SmartAlert', SmartAlertSchema);
export default SmartAlert;
