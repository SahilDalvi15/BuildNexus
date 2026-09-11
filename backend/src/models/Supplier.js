import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema({
  supplierId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  material: { type: String, required: true },
  costPerKg: { type: Number, required: true },
  qualityScore: { type: Number, min: 0, max: 100, default: 80 },
  leadTimeDays: { type: Number, required: true },
  deliveryReliabilityPercent: { type: Number, min: 0, max: 100, default: 90 },
  estimatedCarbonIntensity: { type: Number, default: 0 }, // kgCO2e per kg
  carbonDataSource: { type: String, enum: ['SUPPLIER_REPORTED', 'VERIFIED', 'ESTIMATED', 'DEFAULT_FACTOR'], default: 'ESTIMATED' },
  recycledContentPercent: { type: Number, default: 0 },
  transportDistanceKm: { type: Number, default: 0 },
  transportMode: { type: String, enum: ['ROAD', 'RAIL', 'SEA', 'AIR'], default: 'ROAD' },
  transportCarbonKg: { type: Number, default: 0 },
  overallScore: { type: Number, default: 0 }, // Composite scorecard
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Supplier = mongoose.model('Supplier', SupplierSchema);
export default Supplier;
