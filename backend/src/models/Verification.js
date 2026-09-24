import mongoose from 'mongoose';

const VerificationSchema = new mongoose.Schema({
  verificationId: { type: String, required: true, unique: true },
  recommendationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recommendation', required: true },
  
  baselinePeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  
  measurementPeriod: {
    startDate: { type: Date },
    endDate: { type: Date }
  },

  // What was originally predicted
  estimatedSavings: {
    costUSD: { type: Number, default: 0 },
    carbonKg: { type: Number, default: 0 },
    energyKwh: { type: Number, default: 0 }
  },

  // Raw difference before normalization
  measuredSavings: {
    costUSD: { type: Number, default: 0 },
    carbonKg: { type: Number, default: 0 },
    energyKwh: { type: Number, default: 0 }
  },

  // Final adjusted savings (e.g. accounting for production volume changes)
  verifiedSavings: {
    costUSD: { type: Number, default: 0 },
    carbonKg: { type: Number, default: 0 },
    energyKwh: { type: Number, default: 0 }
  },

  normalizationFactors: [{ type: String }],
  evidence: { type: String },

  status: { 
    type: String, 
    enum: ['IN_PROGRESS', 'COMPLETED', 'FAILED'], 
    default: 'IN_PROGRESS' 
  },

  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date }

}, { timestamps: true });

const Verification = mongoose.model('Verification', VerificationSchema);
export default Verification;
