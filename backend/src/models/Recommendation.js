import mongoose from 'mongoose';

const RecommendationSchema = new mongoose.Schema({
  recommendationId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  problem: { type: String, required: true },
  evidence: { type: String, required: true },
  recommendedAction: { type: String, required: true },
  
  machineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine' },
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },

  predictedImpact: {
    energySavedKwh: { type: Number, default: 0 },
    carbonSavedKg: { type: Number, default: 0 },
    costSavedUSD: { type: Number, default: 0 },
    productionGainedUnits: { type: Number, default: 0 },
    downtimeAvoidedHours: { type: Number, default: 0 }
  },

  confidenceScore: { type: Number, min: 0, max: 100 },

  status: { 
    type: String, 
    enum: [
      'DETECTED', 
      'ANALYZED', 
      'RECOMMENDED', 
      'APPROVED', 
      'REJECTED', 
      'EXECUTED', 
      'MEASURING', 
      'VERIFIED'
    ], 
    default: 'RECOMMENDED' 
  },

  approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  executedAt: { type: Date },
  
  // Link to eventual verification record
  verificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Verification' }

}, { timestamps: true });

const Recommendation = mongoose.model('Recommendation', RecommendationSchema);
export default Recommendation;
