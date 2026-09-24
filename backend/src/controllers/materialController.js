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

// @desc    Simulate Cullet (Recycled Glass) Mix Optimization (Saint-Gobain specific use case)
// @route   POST /api/materials/cullet-optimizer
// @access  Private
export const simulateCulletMix = async (req, res, next) => {
  try {
    const { currentCulletPercent = 20, targetCulletPercent = 30, dailyProductionTons = 1000 } = req.body;

    // Constants based on typical glass manufacturing (approximations for simulation)
    const ENERGY_KWH_PER_TON_VIRGIN = 1500; // kWh to melt 1 ton of virgin material
    const ENERGY_KWH_PER_TON_CULLET = 1200; // kWh to melt 1 ton of cullet (saves ~20%)
    const COST_PER_KWH = 0.12;
    const CARBON_KG_PER_KWH = 0.38;
    const VIRGIN_COST_PER_TON = 80;
    const CULLET_COST_PER_TON = 55;

    // Current State Calculations
    const currentVirginTons = dailyProductionTons * (1 - (currentCulletPercent / 100));
    const currentCulletTons = dailyProductionTons * (currentCulletPercent / 100);
    const currentEnergyKwh = (currentVirginTons * ENERGY_KWH_PER_TON_VIRGIN) + (currentCulletTons * ENERGY_KWH_PER_TON_CULLET);
    
    // Target State Calculations
    const targetVirginTons = dailyProductionTons * (1 - (targetCulletPercent / 100));
    const targetCulletTons = dailyProductionTons * (targetCulletPercent / 100);
    const targetEnergyKwh = (targetVirginTons * ENERGY_KWH_PER_TON_VIRGIN) + (targetCulletTons * ENERGY_KWH_PER_TON_CULLET);

    // Impact Calculations
    const energySavedKwh = currentEnergyKwh - targetEnergyKwh;
    const energyCostSavings = energySavedKwh * COST_PER_KWH;
    
    const currentMaterialCost = (currentVirginTons * VIRGIN_COST_PER_TON) + (currentCulletTons * CULLET_COST_PER_TON);
    const targetMaterialCost = (targetVirginTons * VIRGIN_COST_PER_TON) + (targetCulletTons * CULLET_COST_PER_TON);
    const materialCostSavings = currentMaterialCost - targetMaterialCost;

    const carbonSavedKg = energySavedKwh * CARBON_KG_PER_KWH;
    
    // Quality Risk Calculation (Non-linear risk increase as cullet % goes very high)
    // Up to 40% is usually fine. Above 40%, risk increases rapidly due to impurities.
    let qualityRiskScore = 0;
    if (targetCulletPercent <= 25) qualityRiskScore = 5; // Low risk
    else if (targetCulletPercent <= 40) qualityRiskScore = 15; // Moderate risk
    else if (targetCulletPercent <= 60) qualityRiskScore = 40; // High risk
    else qualityRiskScore = 80; // Critical risk

    const defectProbabilityPercent = (qualityRiskScore / 100) * 12; // Max 12% defect probability

    res.json({
      status: 'success',
      data: {
        simulationId: `CULLET-${Date.now()}`,
        inputs: {
          currentCulletPercent,
          targetCulletPercent,
          dailyProductionTons
        },
        impact: {
          energySavedKwhDaily: parseFloat(energySavedKwh.toFixed(1)),
          energyCostSavingsDailyUSD: parseFloat(energyCostSavings.toFixed(2)),
          materialCostSavingsDailyUSD: parseFloat(materialCostSavings.toFixed(2)),
          totalSavingsDailyUSD: parseFloat((energyCostSavings + materialCostSavings).toFixed(2)),
          carbonSavedKgCO2eDaily: parseFloat(carbonSavedKg.toFixed(1)),
          qualityRisk: {
            score: qualityRiskScore,
            level: qualityRiskScore < 20 ? 'LOW' : qualityRiskScore < 50 ? 'MEDIUM' : 'HIGH',
            defectProbabilityPercent: parseFloat(defectProbabilityPercent.toFixed(2)),
            warning: targetCulletPercent > 40 ? 'High cullet ratio requires advanced optical sorting to prevent inclusions.' : 'Within standard operational bounds.'
          }
        },
        annualized: {
          savingsUSD: parseFloat(((energyCostSavings + materialCostSavings) * 350).toFixed(0)), // Assuming 350 working days
          carbonReducedTons: parseFloat(((carbonSavedKg * 350) / 1000).toFixed(1))
        }
      }
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
