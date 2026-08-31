import mongoose from 'mongoose';

const EnergyReadingSchema = new mongoose.Schema({
  machineId: {
    type: String,
    required: true,
    ref: 'Machine'
  },
  timestamp: {
    type: Date,
    required: true
  },
  consumption: {
    type: Number,
    required: true
  },
  expectedConsumption: {
    type: Number
  },
  deviation: {
    type: Number
  },
  deviationPercentage: {
    type: Number
  },
  isAnomaly: {
    type: Boolean,
    default: false
  },
  anomalyScore: {
    type: Number
  },
  cost: {
    type: Number
  },
  co2Emission: {
    type: Number
  },
  factors: {
    productionVolume: Number,
    ambientTemperature: Number,
    operatingHours: Number
  },
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant'
  }
});

// Indexes for querying efficiency
EnergyReadingSchema.index({ machineId: 1, timestamp: -1 });
EnergyReadingSchema.index({ isAnomaly: 1 });

const EnergyReading = mongoose.model('EnergyReading', EnergyReadingSchema);

export default EnergyReading;
