import SensorReading from '../models/SensorReading.js';

// Constants for calculations
const ENERGY_COST_PER_KWH = 0.12; // USD
const CO2_EMISSION_FACTOR = 0.38; // kg CO2 per kWh

// @desc    Get overall energy metrics and costs
// @route   GET /api/energy/overall
// @access  Public
export const getOverallEnergyMetrics = async (req, res, next) => {
  try {
    // Aggregate all energy consumption
    const result = await SensorReading.aggregate([
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

    const totalCost = totalEnergyKwH * ENERGY_COST_PER_KWH;
    const totalCO2 = totalEnergyKwH * CO2_EMISSION_FACTOR;

    res.json({
      totalEnergyKwH: totalEnergyKwH.toFixed(2),
      averageEnergyKwH: averageEnergyKwH.toFixed(2),
      totalCostUSD: totalCost.toFixed(2),
      totalCO2EmissionsKg: totalCO2.toFixed(2),
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
    const result = await SensorReading.aggregate([
      { $match: { machineId } },
      {
        $group: {
          _id: "$machineId",
          totalEnergyKwH: { $sum: "$energyConsumption" },
          averageEnergyKwH: { $avg: "$energyConsumption" },
          count: { $sum: 1 }
        }
      }
    ]);

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No energy data found for this machine" });
    }

    const { totalEnergyKwH, averageEnergyKwH, count } = result[0];

    res.json({
      machineId,
      readingsCount: count,
      totalEnergyKwH: totalEnergyKwH.toFixed(2),
      averageEnergyKwH: averageEnergyKwH.toFixed(2),
      totalCostUSD: (totalEnergyKwH * ENERGY_COST_PER_KWH).toFixed(2),
      totalCO2EmissionsKg: (totalEnergyKwH * CO2_EMISSION_FACTOR).toFixed(2),
    });
  } catch (error) {
    next(error);
  }
};
