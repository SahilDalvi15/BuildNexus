import Machine from '../models/Machine.js';
import Plant from '../models/Plant.js';

// We will use native fetch to call the Python ML Service
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';

// @desc    Run What-If Simulation
// @route   POST /api/simulator/run
// @access  Private
export const runSimulation = async (req, res, next) => {
    try {
        const { machineId, plantId, modifications } = req.body;
        
        let baseData = {};
        if (machineId) {
            // Get machine baseline specs
            const machine = await Machine.findById(machineId);
            if (!machine) return res.status(404).json({ message: 'Machine not found' });
            baseData = {
                temperature: 70, // Baseline hypothetical values
                vibration: 2.5,
                pressure: 100,
                ...machine.specifications
            };
        } else if (plantId) {
            // Get plant baseline
            const plant = await Plant.findOne({ plantId });
            if (!plant) return res.status(404).json({ message: 'Plant not found' });
            baseData = {
                energyTariff: plant.energyConfiguration?.tariff || 0.12,
                co2Factor: plant.co2Factors?.value || 0.38,
                productionRate: 1000 // units/hr
            };
        } else {
            return res.status(400).json({ message: 'Must specify machineId or plantId' });
        }

        // Apply modifications
        const simulatedData = { ...baseData, ...modifications };

        // For this release, we simulate passing this to the ML engine to see impact.
        // We will call the predict/failure endpoint to get the "simulated" result
        
        let simulationResults = {
            baseline: baseData,
            modified: simulatedData,
            impact: {}
        };

        if (machineId) {
            const response = await fetch(`${ML_SERVICE_URL}/predict/failure`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    machineId: machineId,
                    data: simulatedData
                })
            });

            if (response.ok) {
                const mlResult = await response.json();
                
                // Add simulated RUL
                const baseDays = 30;
                const estimatedDays = Math.max(1, Math.round(baseDays * (1 - (mlResult.probability || 0))));
                
                simulationResults.impact = {
                    projectedFailureProbability: mlResult.probability,
                    projectedRulDays: estimatedDays,
                    riskLevel: mlResult.probability > 0.7 ? 'CRITICAL' : (mlResult.probability > 0.4 ? 'WARNING' : 'NORMAL')
                };
            } else {
                // Mock result if ML service is down
                simulationResults.impact = {
                    message: 'Simulated impact based on internal heuristics',
                    projectedFailureProbability: Math.min(0.99, (simulatedData.temperature / 100) * 0.5),
                    projectedRulDays: Math.max(2, 30 - (simulatedData.temperature - 70))
                };
            }
        }

        if (plantId) {
            // Plant level simulation (e.g. changing tariff)
            const projectedEnergyCost = simulatedData.productionRate * 10 * simulatedData.energyTariff;
            simulationResults.impact = {
                projectedHourlyEnergyCost: projectedEnergyCost,
                projectedCO2: simulatedData.productionRate * 10 * simulatedData.co2Factor
            };
        }

        res.json({
            simulationId: `SIM-${Date.now()}`,
            timestamp: new Date(),
            ...simulationResults
        });

    } catch (error) {
        next(error);
    }
};
