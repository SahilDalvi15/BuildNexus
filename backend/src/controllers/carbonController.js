import EmissionFactor from '../models/EmissionFactor.js';
import SensorReading from '../models/SensorReading.js';
import { calculateEmissions } from '../services/carbonEngine.js';

// @desc    Get total carbon emissions broken down by scope
// @route   GET /api/carbon/summary
// @access  Private
export const getCarbonSummary = async (req, res, next) => {
    try {
        // 1. Calculate Scope 2 (Electricity) from existing energy data
        const energyResult = await SensorReading.aggregate([
            {
                $group: {
                    _id: null,
                    totalEnergyKwH: { $sum: "$energyConsumption" }
                }
            }
        ]);
        
        const totalEnergy = energyResult.length > 0 ? energyResult[0].totalEnergyKwH : 0;
        
        // Use Carbon Engine to get dynamic Scope 2 emissions
        const scope2Emissions = await calculateEmissions(totalEnergy, 'Electricity', 'SCOPE_2');

        // Mock Scope 1 and 3 for Phase 3 dashboard demonstration
        const scope1Emissions = await calculateEmissions(500, 'Fuel', 'SCOPE_1'); // Simulated 500 liters of diesel
        const scope3Emissions = await calculateEmissions(1200, 'Raw Material', 'SCOPE_3'); // Simulated 1200 kg of material
        
        res.json({
            status: 'success',
            data: {
                scope1: scope1Emissions,
                scope2: scope2Emissions,
                scope3: scope3Emissions,
                totalTCO2e: ((scope1Emissions?.emissionsKg || 0) + (scope2Emissions?.emissionsKg || 0) + (scope3Emissions?.emissionsKg || 0)) / 1000,
                productionUnits: 150000, // Simulated production volume
                carbonIntensity: (((scope1Emissions?.emissionsKg || 0) + (scope2Emissions?.emissionsKg || 0)) / 1000) / 150000 // tCO2e per unit
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get active emission factors
// @route   GET /api/carbon/factors
// @access  Private
export const getEmissionFactors = async (req, res, next) => {
    try {
        const factors = await EmissionFactor.find({ isActive: true })
            .sort({ scope: 1, category: 1 });

        res.json({
            status: 'success',
            count: factors.length,
            data: factors
        });
    } catch (error) {
        next(error);
    }
};
