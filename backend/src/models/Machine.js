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
    type: String,
    required: true,
    index: true
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
