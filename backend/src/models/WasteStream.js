import mongoose from 'mongoose';

const WasteStreamSchema = new mongoose.Schema({
  streamId: {
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
  materialType: {
    type: String,
    required: true // e.g., "Glass Cullet", "Metal Scrap", "Plastic Film"
  },
  sourceProcess: {
    type: String,
    required: true // e.g., "Cutting", "Forming", "Finishing"
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true,
    default: 'kg'
  },
  recoverability: {
    type: String,
    enum: ['RECOVERABLE', 'DISPOSAL'],
    required: true
  },
  recoveryPathways: [{
    type: String // e.g., "Internal Reuse", "Recycling", "Alternative Material"
  }],
  disposalMethod: {
    type: String // e.g., "Landfill", "Incineration", "Recycling Partner"
  },
  cost: {
    type: Number,
    default: 0 // USD cost of disposal or negative if revenue from recycling
  },
  estimatedCarbonImpactKg: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'REVIEWED', 'OPTIMIZED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

const WasteStream = mongoose.model('WasteStream', WasteStreamSchema);

export default WasteStream;
