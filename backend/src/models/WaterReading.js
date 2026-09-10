import mongoose from 'mongoose';

const WaterReadingSchema = new mongoose.Schema({
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant'
  },
  totalConsumptionM3: {
    type: Number,
    required: true
  },
  processWaterM3: {
    type: Number,
    required: true
  },
  coolingWaterM3: {
    type: Number,
    required: true
  },
  cleaningWaterM3: {
    type: Number,
    required: true
  },
  otherWaterM3: {
    type: Number,
    default: 0
  },
  reusePercentage: {
    type: Number,
    default: 0
  },
  waterIntensity: {
    type: Number,
    default: 0 // m³ per unit of production
  },
  leakageIndicator: {
    type: Boolean,
    default: false
  },
  leakageNotes: {
    type: String
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const WaterReading = mongoose.model('WaterReading', WaterReadingSchema);

export default WaterReading;
