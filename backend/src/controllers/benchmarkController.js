import Plant from '../models/Plant.js';
import SensorReading from '../models/SensorReading.js';
import WasteStream from '../models/WasteStream.js';
import WaterReading from '../models/WaterReading.js';

// @desc    Get cross-plant benchmarking comparison (PRD Section 29)
// @route   GET /api/benchmarking/compare
// @access  Private
export const getCrossPlantBenchmark = async (req, res, next) => {
  try {
    const plants = await Plant.find().lean();

    if (!plants || plants.length === 0) {
      // Generate mock benchmarking data for demonstration
      const mockPlants = [
        {
          plantId: 'PLANT-A',
          name: 'Plant A — Mumbai',
          region: 'Asia-Pacific',
          metrics: {
            oee: 87.2,
            energyIntensity: 0.42, // kWh per unit
            carbonIntensity: 0.16, // kgCO2e per unit
            wastePerUnit: 0.034, // kg per unit
            waterIntensity: 0.0028, // m³ per unit
            downtimePercent: 3.1,
            qualityYield: 97.8,
            maintenanceCostPerUnit: 0.018,
            productionEfficiency: 94.5
          }
        },
        {
          plantId: 'PLANT-B',
          name: 'Plant B — Pune',
          region: 'Asia-Pacific',
          metrics: {
            oee: 82.5,
            energyIntensity: 0.51,
            carbonIntensity: 0.19,
            wastePerUnit: 0.045,
            waterIntensity: 0.0035,
            downtimePercent: 5.2,
            qualityYield: 95.1,
            maintenanceCostPerUnit: 0.024,
            productionEfficiency: 89.3
          }
        },
        {
          plantId: 'PLANT-C',
          name: 'Plant C — Chennai',
          region: 'Asia-Pacific',
          metrics: {
            oee: 91.0,
            energyIntensity: 0.38,
            carbonIntensity: 0.14,
            wastePerUnit: 0.028,
            waterIntensity: 0.0022,
            downtimePercent: 2.4,
            qualityYield: 98.5,
            maintenanceCostPerUnit: 0.015,
            productionEfficiency: 96.1
          }
        }
      ];

      // Identify best-in-class for each metric
      const metricKeys = Object.keys(mockPlants[0].metrics);
      const higherIsBetter = ['oee', 'qualityYield', 'productionEfficiency'];
      
      const bestPractices = {};
      for (const key of metricKeys) {
        const isHigherBetter = higherIsBetter.includes(key);
        let bestPlant = mockPlants[0];
        for (const plant of mockPlants) {
          if (isHigherBetter ? plant.metrics[key] > bestPlant.metrics[key] : plant.metrics[key] < bestPlant.metrics[key]) {
            bestPlant = plant;
          }
        }
        bestPractices[key] = { bestValue: bestPlant.metrics[key], plantName: bestPlant.name };
      }

      return res.json({
        status: 'success',
        classification: 'Comparisons are normalized but may not account for all differences in product mix and operating conditions.',
        count: mockPlants.length,
        data: mockPlants,
        bestPractices
      });
    }

    // If real plants exist, aggregate real data (future enhancement)
    res.json({
      status: 'success',
      count: plants.length,
      data: plants,
      bestPractices: {}
    });

  } catch (error) {
    next(error);
  }
};
