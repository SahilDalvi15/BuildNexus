import SensorReading from '../models/SensorReading.js';
import Plant from '../models/Plant.js';

// @desc    Get sustainability and emissions dashboard
// @route   GET /api/sustainability
// @access  Private
export const getSustainabilityMetrics = async (req, res, next) => {
  try {
    const { plantId } = req.query;
    const matchStage = plantId ? { $match: { plantId } } : { $match: {} };

    // Get energy aggregate
    const energyData = await SensorReading.aggregate([
      matchStage,
      {
        $group: {
          _id: null,
          totalEnergyKwH: { $sum: "$energyConsumption" }
        }
      }
    ]);

    const totalEnergy = energyData.length > 0 ? energyData[0].totalEnergyKwH : 0;
    
    // Resolve factors
    let co2Factor = 0.38; // Default
    if (plantId) {
        const plant = await Plant.findOne({ plantId });
        if (plant && plant.co2Factors?.value) {
            co2Factor = plant.co2Factors.value;
        }
    }

    const totalEmissions = totalEnergy * co2Factor;

    // Simulate renewable energy percentage for this release
    const renewablePercentage = plantId ? 35.5 : 22.0;

    res.json({
        totalEnergyKwH: totalEnergy,
        totalCO2EmissionsKg: totalEmissions,
        co2IntensityFactor: co2Factor,
        renewableEnergyPercentage: renewablePercentage,
        estimatedCarbonOffset: (totalEmissions * (renewablePercentage / 100)),
        timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
};
