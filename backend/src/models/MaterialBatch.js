import mongoose from 'mongoose';

const MaterialBatchSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true
  },
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant'
  },
  lineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductionLine'
  },
  productName: {
    type: String,
    required: true
  },
  virginMaterialPercent: {
    type: Number,
    required: true
  },
  recycledMaterialPercent: {
    type: Number,
    required: true
  },
  renewableMaterialPercent: {
    type: Number,
    default: 0
  },
  totalMaterialKg: {
    type: Number,
    required: true
  },
  materialYield: {
    type: Number,
    required: true // e.g., 94.8 means 94.8%
  },
  scrapPercent: {
    type: Number,
    required: true // e.g., 5.2 means 5.2%
  },
  scrapKg: {
    type: Number,
    required: true
  },
  costPerKg: {
    type: Number,
    default: 0
  },
  carbonFactorKgCO2ePerKg: {
    type: Number,
    default: 0
  },
  producedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const MaterialBatch = mongoose.model('MaterialBatch', MaterialBatchSchema);

export default MaterialBatch;
