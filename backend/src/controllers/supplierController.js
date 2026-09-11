import Supplier from '../models/Supplier.js';

// @desc    Get supplier scorecards (PRD Section 31)
// @route   GET /api/suppliers
// @access  Private
export const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find({ isActive: true }).sort({ overallScore: -1 });
    res.json({ status: 'success', count: suppliers.length, data: suppliers });
  } catch (error) { next(error); }
};

// @desc    Get supplier carbon intelligence (PRD Section 32)
// @route   GET /api/suppliers/carbon
// @access  Private
export const getSupplierCarbonIntel = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find({ isActive: true }).sort({ estimatedCarbonIntensity: 1 });
    const total = suppliers.reduce((s, sup) => s + sup.estimatedCarbonIntensity + sup.transportCarbonKg, 0);
    res.json({
      status: 'success',
      totalSupplyChainCarbonKg: parseFloat(total.toFixed(1)),
      data: suppliers.map(s => ({
        name: s.name, material: s.material,
        materialCarbonKgPerKg: s.estimatedCarbonIntensity,
        transportCarbonKg: s.transportCarbonKg,
        dataSource: s.carbonDataSource,
        recycledContentPercent: s.recycledContentPercent
      }))
    });
  } catch (error) { next(error); }
};

export const seedMockSuppliers = async () => {
  try {
    const count = await Supplier.countDocuments();
    if (count > 0) return;
    console.log('[SupplierIntel] Seeding mock suppliers...');
    await Supplier.insertMany([
      { supplierId: 'SUP-001', name: 'GlassCo India', material: 'Soda-Lime Glass', costPerKg: 0.32, qualityScore: 92, leadTimeDays: 5, deliveryReliabilityPercent: 96, estimatedCarbonIntensity: 1.45, carbonDataSource: 'SUPPLIER_REPORTED', recycledContentPercent: 35, transportDistanceKm: 120, transportMode: 'ROAD', transportCarbonKg: 18, overallScore: 88 },
      { supplierId: 'SUP-002', name: 'MetalWorks Ltd', material: 'Aluminium Ingot', costPerKg: 1.85, qualityScore: 87, leadTimeDays: 12, deliveryReliabilityPercent: 88, estimatedCarbonIntensity: 8.20, carbonDataSource: 'ESTIMATED', recycledContentPercent: 22, transportDistanceKm: 450, transportMode: 'ROAD', transportCarbonKg: 56, overallScore: 72 },
      { supplierId: 'SUP-003', name: 'EcoResin Corp', material: 'Recycled PET Resin', costPerKg: 0.95, qualityScore: 78, leadTimeDays: 8, deliveryReliabilityPercent: 91, estimatedCarbonIntensity: 0.65, carbonDataSource: 'VERIFIED', recycledContentPercent: 100, transportDistanceKm: 280, transportMode: 'RAIL', transportCarbonKg: 8, overallScore: 85 }
    ]);
  } catch (error) { console.error('[SupplierIntel] Seed error:', error); }
};
