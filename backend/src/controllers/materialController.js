import MaterialBatch from '../models/MaterialBatch.js';

// @desc    Get material batch records with aggregated stats
// @route   GET /api/materials/batches
// @access  Private
export const getMaterialBatches = async (req, res, next) => {
  try {
    const batches = await MaterialBatch.find().sort({ producedAt: -1 }).limit(20);

    const stats = await MaterialBatch.aggregate([
      {
        $group: {
          _id: null,
          avgVirgin: { $avg: '$virginMaterialPercent' },
          avgRecycled: { $avg: '$recycledMaterialPercent' },
          avgYield: { $avg: '$materialYield' },
          avgScrap: { $avg: '$scrapPercent' },
          totalMaterialKg: { $sum: '$totalMaterialKg' },
          totalScrapKg: { $sum: '$scrapKg' }
        }
      }
    ]);

    res.json({
      status: 'success',
      count: batches.length,
      summary: stats.length > 0 ? {
        avgVirginPercent: parseFloat(stats[0].avgVirgin.toFixed(1)),
        avgRecycledPercent: parseFloat(stats[0].avgRecycled.toFixed(1)),
        avgYield: parseFloat(stats[0].avgYield.toFixed(1)),
        avgScrapPercent: parseFloat(stats[0].avgScrap.toFixed(1)),
        totalMaterialKg: parseFloat(stats[0].totalMaterialKg.toFixed(0)),
        totalScrapKg: parseFloat(stats[0].totalScrapKg.toFixed(0))
      } : null,
      data: batches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Identify material optimization opportunities (PRD Section 23)
// @route   GET /api/materials/optimization
// @access  Private
export const getMaterialOptimization = async (req, res, next) => {
  try {
    const batches = await MaterialBatch.find().sort({ producedAt: -1 });

    const opportunities = [];

    for (const batch of batches) {
      const issues = [];

      if (batch.virginMaterialPercent > 80) {
        issues.push({ type: 'HIGH_VIRGIN_USAGE', detail: `${batch.virginMaterialPercent}% virgin material`, recommendation: 'Evaluate increasing recycled content where engineering constraints allow.' });
      }
      if (batch.scrapPercent > 8) {
        issues.push({ type: 'HIGH_SCRAP', detail: `${batch.scrapPercent}% scrap rate`, recommendation: 'Review process parameters and tooling condition to reduce scrap.' });
      }
      if (batch.materialYield < 90) {
        issues.push({ type: 'LOW_YIELD', detail: `${batch.materialYield}% yield`, recommendation: 'Investigate root cause of low yield — potential process or quality issue.' });
      }

      if (issues.length > 0) {
        opportunities.push({
          batchId: batch.batchId,
          productName: batch.productName,
          issues
        });
      }
    }

    res.json({
      status: 'success',
      count: opportunities.length,
      data: opportunities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Seed mock material batches for demonstration.
 */
export const seedMockMaterialBatches = async () => {
  try {
    const count = await MaterialBatch.countDocuments();
    if (count > 0) return;

    console.log('[MaterialIntel] Seeding initial material batches...');

    const mockBatches = [
      { batchId: 'BATCH-2048', productName: 'Flat Glass Panel A', virginMaterialPercent: 68, recycledMaterialPercent: 32, totalMaterialKg: 4200, materialYield: 94.8, scrapPercent: 5.2, scrapKg: 218, costPerKg: 0.42, carbonFactorKgCO2ePerKg: 1.85 },
      { batchId: 'BATCH-2049', productName: 'Insulation Board B', virginMaterialPercent: 45, recycledMaterialPercent: 55, totalMaterialKg: 3100, materialYield: 97.1, scrapPercent: 2.9, scrapKg: 90, costPerKg: 0.38, carbonFactorKgCO2ePerKg: 1.20 },
      { batchId: 'BATCH-2050', productName: 'Pipe Fitting C', virginMaterialPercent: 92, recycledMaterialPercent: 8, totalMaterialKg: 1800, materialYield: 88.3, scrapPercent: 11.7, scrapKg: 211, costPerKg: 0.65, carbonFactorKgCO2ePerKg: 2.40 },
      { batchId: 'BATCH-2051', productName: 'Roofing Tile D', virginMaterialPercent: 74, recycledMaterialPercent: 26, totalMaterialKg: 5600, materialYield: 96.2, scrapPercent: 3.8, scrapKg: 213, costPerKg: 0.29, carbonFactorKgCO2ePerKg: 0.95 }
    ];

    await MaterialBatch.insertMany(mockBatches);
  } catch (error) {
    console.error('[MaterialIntel] Error seeding material batches:', error);
  }
};
