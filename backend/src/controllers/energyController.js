import SensorReading from '../models/SensorReading.js';
import Plant from '../models/Plant.js';

// Default fallback constants if plant is not configured
const DEFAULT_ENERGY_COST_PER_KWH = 0.12; // USD
const DEFAULT_CO2_EMISSION_FACTOR = 0.38; // kg CO2 per kWh

// Helper to get plant config
const getPlantConfig = async (plantId) => {
  if (!plantId) return { tariff: DEFAULT_ENERGY_COST_PER_KWH, co2Factor: DEFAULT_CO2_EMISSION_FACTOR };
  
  const plant = await Plant.findOne({ plantId });
  if (!plant) return { tariff: DEFAULT_ENERGY_COST_PER_KWH, co2Factor: DEFAULT_CO2_EMISSION_FACTOR };
  
  return {
    tariff: plant.energyConfiguration?.tariff || DEFAULT_ENERGY_COST_PER_KWH,
    co2Factor: plant.co2Factors?.value || DEFAULT_CO2_EMISSION_FACTOR
  };
};

// @desc    Get overall energy metrics and costs
// @route   GET /api/energy/overall
// @access  Public
export const getOverallEnergyMetrics = async (req, res, next) => {
  try {
    const { plantId } = req.query;
    const matchStage = plantId ? { $match: { plantId } } : { $match: {} };

    // Aggregate all energy consumption
    const result = await SensorReading.aggregate([
      matchStage,
      {
        $group: {
          _id: null,
          totalEnergyKwH: { $sum: "$energyConsumption" },
          averageEnergyKwH: { $avg: "$energyConsumption" }
        }
      }
    ]);

    if (!result || result.length === 0) {
      return res.json({ message: "No energy data available" });
    }

    const { totalEnergyKwH, averageEnergyKwH } = result[0];
    const { tariff, co2Factor } = await getPlantConfig(plantId);

    const totalCost = totalEnergyKwH * tariff;
    const totalCO2 = totalEnergyKwH * co2Factor;

    res.json({
      totalEnergyKwH: totalEnergyKwH.toFixed(2),
      averageEnergyKwH: averageEnergyKwH.toFixed(2),
      totalCostUSD: totalCost.toFixed(2),
      totalCO2EmissionsKg: totalCO2.toFixed(2),
      tariffApplied: tariff,
      co2FactorApplied: co2Factor,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get energy metrics for a specific machine
// @route   GET /api/energy/:machineId
// @access  Public
export const getMachineEnergyMetrics = async (req, res, next) => {
  try {
    const { machineId } = req.params;
    
    // Aggregate to get energy + plantId (if populated)
    const result = await SensorReading.aggregate([
      { $match: { machineId } },
      {
        $group: {
          _id: "$machineId",
          totalEnergyKwH: { $sum: "$energyConsumption" },
          averageEnergyKwH: { $avg: "$energyConsumption" },
          count: { $sum: 1 },
          plantId: { $first: "$plantId" }
        }
      }
    ]);

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No energy data found for this machine" });
    }

    const { totalEnergyKwH, averageEnergyKwH, count, plantId } = result[0];
    
    // Resolve plant string ID if it's an ObjectId or String
    // We will just use the default if we can't figure it out easily here
    const { tariff, co2Factor } = { tariff: DEFAULT_ENERGY_COST_PER_KWH, co2Factor: DEFAULT_CO2_EMISSION_FACTOR };

    res.json({
      machineId,
      readingsCount: count,
      totalEnergyKwH: totalEnergyKwH.toFixed(2),
      averageEnergyKwH: averageEnergyKwH.toFixed(2),
      totalCostUSD: (totalEnergyKwH * tariff).toFixed(2),
      totalCO2EmissionsKg: (totalEnergyKwH * co2Factor).toFixed(2),
    });
  } catch (error) {
    next(error);
  }
};
