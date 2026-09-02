import mongoose from 'mongoose';

const MachineSchema = new mongoose.Schema({
  machineId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant'
  },
  type: {
    type: String,
    required: true,
    index: true
  },
  productionLine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductionLine',
    index: true
  },
  zoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlantZone',
    index: true
  },
  spatialCoordinates: {
    x: { type: Number },
    y: { type: Number },
    orientation: { type: Number, default: 0 } // degrees
  },
  installationDate: {
    type: Date,
    required: true
  },
  manufacturer: {
    type: String
  },
  model: {
    type: String
  },
  specifications: {
    maxTemp: Number,
    maxVibration: Number,
    maxPressure: Number,
    powerRating: Number,
    expectedLifespan: Number
  },
  sensors: [{
    type: String
  }],
  maintenanceHistory: [{
    date: Date,
    type: { type: String },
    description: String,
    technician: String
  }],
  currentStatus: {
    type: String,
    enum: ['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR'],
    default: 'ONLINE'
  }
}, {
  timestamps: true
});

const Machine = mongoose.model('Machine', MachineSchema);

export default Machine;
