import mongoose from 'mongoose';

const SensorReadingSchema = new mongoose.Schema({
  machineId: {
    type: String,
    required: true,
    ref: 'Machine'
  },
  timestamp: {
    type: Date,
    required: true
  },
  readings: {
    temperature: Number,
    vibration: Number,
    pressure: Number,
    current: Number,
    voltage: Number,
    powerFactor: Number
  },
  energyConsumption: {
    type: Number
  },
  operatingStatus: {
    type: String,
    enum: ['RUNNING', 'IDLE', 'STOPPED', 'ERROR']
  },
  productionCount: {
    type: Number,
    default: 0
  },
  qualityMetrics: {
    defectRate: Number,
    scrapRate: Number
  },
  derivedMetrics: {
    OEE: Number,
    availability: Number,
    performance: Number,
    quality: Number
  },
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
});

// Compound index for fast time-series queries per machine
SensorReadingSchema.index({ machineId: 1, timestamp: -1 });

const SensorReading = mongoose.model('SensorReading', SensorReadingSchema);

export default SensorReading;
