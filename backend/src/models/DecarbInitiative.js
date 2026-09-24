import mongoose from 'mongoose';

const DecarbInitiativeSchema = new mongoose.Schema({
  initiativeId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: [
      'ENERGY_EFFICIENCY', 
      'RENEWABLE_ELECTRICITY', 
      'LOW_CARBON_FUEL', 
      'MATERIAL_OPTIMIZATION', 
      'RECYCLED_MATERIALS', 
      'WASTE_REDUCTION', 
      'PROCESS_OPTIMIZATION', 
      'EQUIPMENT_UPGRADE'
    ],
    required: true
  },
  
  description: { type: String },
  
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },

  timeline: {
    proposedYear: { type: Number },
    targetCompletionYear: { type: Number },
    actualCompletionDate: { type: Date }
  },

  financials: {
    estimatedCapexUSD: { type: Number, default: 0 },
    estimatedAnnualSavingsUSD: { type: Number, default: 0 },
    roiYears: { type: Number }
  },

  carbonImpact: {
    estimatedAnnualReductionTons: { type: Number, default: 0 },
    verifiedAnnualReductionTons: { type: Number, default: 0 }
  },

  status: { 
    type: String, 
    enum: [
      'IDENTIFIED', 
      'EVALUATING', 
      'APPROVED', 
      'IN_PROGRESS', 
      'COMPLETED', 
      'VERIFIED'
    ], 
    default: 'IDENTIFIED' 
  },

  // Linking to verified impact if it was executed through a recommendation
  verificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Verification' }

}, { timestamps: true });

const DecarbInitiative = mongoose.model('DecarbInitiative', DecarbInitiativeSchema);
export default DecarbInitiative;
