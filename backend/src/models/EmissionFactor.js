import mongoose from 'mongoose';

const EmissionFactorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g., "US Grid Average", "Diesel Combustion"
    index: true
  },
  scope: {
    type: String,
    enum: ['SCOPE_1', 'SCOPE_2', 'SCOPE_3'],
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true // e.g., "Electricity", "Fuel", "Raw Material"
  },
  factorValue: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true // e.g., "kgCO2e/kWh", "kgCO2e/liter"
  },
  source: {
    type: String,
    required: true // e.g., "EPA 2023", "DEFRA 2024"
  },
  version: {
    type: String,
    required: true // e.g., "1.0", "2023-v2"
  },
  effectiveDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant', // Null implies an organization-wide default
  }
}, {
  timestamps: true
});

const EmissionFactor = mongoose.model('EmissionFactor', EmissionFactorSchema);

export default EmissionFactor;
