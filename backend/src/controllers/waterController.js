import WaterReading from '../models/WaterReading.js';

// @desc    Get water consumption summary
// @route   GET /api/water/summary
// @access  Private
export const getWaterSummary = async (req, res, next) => {
  try {
    const readings = await WaterReading.find().sort({ recordedAt: -1 }).limit(30);

    const stats = await WaterReading.aggregate([
      {
        $group: {
          _id: null,
          totalConsumption: { $sum: '$totalConsumptionM3' },
          totalProcess: { $sum: '$processWaterM3' },
          totalCooling: { $sum: '$coolingWaterM3' },
          totalCleaning: { $sum: '$cleaningWaterM3' },
          totalOther: { $sum: '$otherWaterM3' },
          avgReuse: { $avg: '$reusePercentage' },
          avgIntensity: { $avg: '$waterIntensity' },
          leakageCount: { $sum: { $cond: ['$leakageIndicator', 1, 0] } }
        }
      }
    ]);

    const summary = stats.length > 0 ? {
      totalConsumptionM3: parseFloat(stats[0].totalConsumption.toFixed(1)),
      breakdown: {
        processM3: parseFloat(stats[0].totalProcess.toFixed(1)),
        coolingM3: parseFloat(stats[0].totalCooling.toFixed(1)),
        cleaningM3: parseFloat(stats[0].totalCleaning.toFixed(1)),
        otherM3: parseFloat(stats[0].totalOther.toFixed(1)),
        processPercent: parseFloat(((stats[0].totalProcess / stats[0].totalConsumption) * 100).toFixed(1)),
        coolingPercent: parseFloat(((stats[0].totalCooling / stats[0].totalConsumption) * 100).toFixed(1)),
        cleaningPercent: parseFloat(((stats[0].totalCleaning / stats[0].totalConsumption) * 100).toFixed(1)),
        otherPercent: parseFloat(((stats[0].totalOther / stats[0].totalConsumption) * 100).toFixed(1))
      },
      avgReusePercent: parseFloat(stats[0].avgReuse.toFixed(1)),
      avgWaterIntensity: parseFloat(stats[0].avgIntensity.toFixed(4)),
      leakageAlerts: stats[0].leakageCount
    } : null;

    res.json({
      status: 'success',
      summary,
      recentReadings: readings.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Seed mock water readings for demonstration.
 */
export const seedMockWaterReadings = async () => {
  try {
    const count = await WaterReading.countDocuments();
    if (count > 0) return;

    console.log('[WaterIntel] Seeding initial water readings...');

    const mockReadings = [
      { totalConsumptionM3: 420, processWaterM3: 130, coolingWaterM3: 202, cleaningWaterM3: 59, otherWaterM3: 29, reusePercentage: 12, waterIntensity: 0.0028, leakageIndicator: false },
      { totalConsumptionM3: 491, processWaterM3: 152, coolingWaterM3: 236, cleaningWaterM3: 69, otherWaterM3: 34, reusePercentage: 11, waterIntensity: 0.0033, leakageIndicator: true, leakageNotes: 'Cooling loop pressure drop detected — potential micro-leak in Zone C.' },
      { totalConsumptionM3: 385, processWaterM3: 119, coolingWaterM3: 185, cleaningWaterM3: 54, otherWaterM3: 27, reusePercentage: 14, waterIntensity: 0.0026, leakageIndicator: false }
    ];

    await WaterReading.insertMany(mockReadings);
  } catch (error) {
    console.error('[WaterIntel] Error seeding water readings:', error);
  }
};
