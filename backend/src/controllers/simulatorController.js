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

import { v4 as uuidv4 } from 'uuid';

// @desc    Run structured What-If Scenario (Simulator 2.0 — PRD Section 26)
// @route   POST /api/simulator/scenario
// @access  Private
export const runScenarioSimulation = async (req, res, next) => {
    try {
        const { type, parameters } = req.body;

        const validTypes = ['MAINTENANCE', 'PRODUCTION', 'ENERGY', 'CARBON', 'MATERIALS', 'CAPACITY'];
        if (!type || !validTypes.includes(type.toUpperCase())) {
            return res.status(400).json({
                status: 'error',
                message: `Invalid scenario type. Must be one of: ${validTypes.join(', ')}`
            });
        }

        const scenarioId = `SCN-${uuidv4().substring(0, 8).toUpperCase()}`;
        let result = {};

        switch (type.toUpperCase()) {
            case 'MAINTENANCE': {
                // "What if Machine X is unavailable for Y hours?"
                const hours = parameters?.downtimeHours || 8;
                const productionRate = parameters?.productionRatePerHour || 300;
                const energyPerHour = parameters?.energyKwhPerHour || 45;
                const lostUnits = hours * productionRate;
                const energySaved = hours * energyPerHour;

                result = {
                    inputs: { downtimeHours: hours, productionRatePerHour: productionRate },
                    assumptions: ['Linear production rate assumed', 'No ramp-up time considered'],
                    productionImpact: { lostUnits, lostPercent: parseFloat(((lostUnits / (productionRate * 24)) * 100).toFixed(1)) },
                    energyImpact: { savedKwh: energySaved, note: 'Machine is powered down during maintenance' },
                    carbonImpact: { savedKgCO2e: parseFloat((energySaved * 0.38).toFixed(1)) },
                    costImpact: { lostRevenueUSD: lostUnits * 0.85, savedEnergyUSD: parseFloat((energySaved * 0.12).toFixed(2)) },
                    qualityRisk: 'Low — planned maintenance typically improves post-maintenance quality'
                };
                break;
            }
            case 'PRODUCTION': {
                // "What if demand increases by X%?"
                const increasePercent = parameters?.demandIncreasePercent || 15;
                const currentDailyOutput = parameters?.currentDailyOutput || 7200;
                const additionalUnits = currentDailyOutput * (increasePercent / 100);
                const additionalEnergy = additionalUnits * 0.15;

                result = {
                    inputs: { demandIncreasePercent: increasePercent, currentDailyOutput },
                    assumptions: ['Proportional energy increase assumed', 'No capacity constraints considered'],
                    productionImpact: { additionalUnits: parseFloat(additionalUnits.toFixed(0)), newDailyOutput: parseFloat((currentDailyOutput + additionalUnits).toFixed(0)) },
                    energyImpact: { additionalKwh: parseFloat(additionalEnergy.toFixed(1)) },
                    carbonImpact: { additionalKgCO2e: parseFloat((additionalEnergy * 0.38).toFixed(1)) },
                    costImpact: { additionalEnergyCostUSD: parseFloat((additionalEnergy * 0.12).toFixed(2)), additionalRevenueUSD: parseFloat((additionalUnits * 0.85).toFixed(2)) },
                    qualityRisk: increasePercent > 20 ? 'High — exceeding 20% may strain capacity and increase defect rates' : 'Medium'
                };
                break;
            }
            case 'ENERGY': {
                // "What if energy consumption is reduced by X%?"
                const reductionPercent = parameters?.energyReductionPercent || 10;
                const currentEnergyKwh = parameters?.currentDailyEnergyKwh || 5000;
                const savedKwh = currentEnergyKwh * (reductionPercent / 100);

                result = {
                    inputs: { energyReductionPercent: reductionPercent, currentDailyEnergyKwh: currentEnergyKwh },
                    assumptions: ['Reduction achievable through identified opportunities', 'No impact on production output assumed'],
                    productionImpact: { change: 'None projected' },
                    energyImpact: { savedKwh: parseFloat(savedKwh.toFixed(1)), newDailyKwh: parseFloat((currentEnergyKwh - savedKwh).toFixed(1)) },
                    carbonImpact: { savedKgCO2e: parseFloat((savedKwh * 0.38).toFixed(1)) },
                    costImpact: { annualSavingsUSD: parseFloat((savedKwh * 365 * 0.12).toFixed(0)) },
                    qualityRisk: 'Low'
                };
                break;
            }
            case 'CARBON': {
                // "What if the plant needs an X% carbon reduction?"
                const targetReduction = parameters?.carbonReductionPercent || 20;
                const currentEmissionsKg = parameters?.currentAnnualEmissionsKg || 2000000;
                const targetEmissionsKg = currentEmissionsKg * (1 - targetReduction / 100);

                result = {
                    inputs: { carbonReductionPercent: targetReduction, currentAnnualEmissionsKg: currentEmissionsKg },
                    assumptions: ['Combined levers of energy + waste + materials considered'],
                    productionImpact: { change: targetReduction > 30 ? 'Potential 2-5% reduction in throughput' : 'Minimal impact projected' },
                    energyImpact: { requiredEnergyReductionPercent: parseFloat((targetReduction * 0.6).toFixed(1)) },
                    carbonImpact: { targetEmissionsKg: parseFloat(targetEmissionsKg.toFixed(0)), reductionNeededKg: parseFloat((currentEmissionsKg - targetEmissionsKg).toFixed(0)) },
                    costImpact: { estimatedInvestmentUSD: parseFloat((targetReduction * 2500).toFixed(0)) },
                    qualityRisk: targetReduction > 25 ? 'Medium — aggressive targets may constrain process flexibility' : 'Low'
                };
                break;
            }
            case 'MATERIALS': {
                // "What if recycled material increases by X%?"
                const increasePercent = parameters?.recycledIncreasePercent || 8;
                const currentRecycledPercent = parameters?.currentRecycledPercent || 30;

                result = {
                    inputs: { recycledIncreasePercent: increasePercent, currentRecycledPercent },
                    assumptions: ['Engineering feasibility assumed', 'No quality degradation within this range'],
                    productionImpact: { change: 'Minimal — within acceptable formulation window' },
                    energyImpact: { change: 'Potential 1-2% reduction due to lower processing energy for recycled inputs' },
                    carbonImpact: { estimatedReductionPercent: parseFloat((increasePercent * 0.4).toFixed(1)) },
                    costImpact: { potentialSavingsPercent: parseFloat((increasePercent * 0.15).toFixed(1)), note: 'Recycled inputs are typically 10-20% cheaper' },
                    qualityRisk: increasePercent > 15 ? 'High — must validate product specifications' : 'Low'
                };
                break;
            }
            case 'CAPACITY': {
                // "What if Line X is unavailable?"
                const lineId = parameters?.lineId || 'Line-2';
                const lineCapacityPercent = parameters?.lineCapacityPercent || 25;

                result = {
                    inputs: { lineId, lineCapacityPercent },
                    assumptions: ['Remaining lines cannot absorb lost capacity', 'No overtime shift considered'],
                    productionImpact: { lostCapacityPercent: lineCapacityPercent, adjustedOutputPercent: parseFloat((100 - lineCapacityPercent).toFixed(1)) },
                    energyImpact: { savedKwhPercent: parseFloat((lineCapacityPercent * 0.8).toFixed(1)), note: 'Partial savings — baseline load remains' },
                    carbonImpact: { reducedPercent: parseFloat((lineCapacityPercent * 0.7).toFixed(1)) },
                    costImpact: { lostRevenuePercent: lineCapacityPercent, savedEnergyPercent: parseFloat((lineCapacityPercent * 0.8).toFixed(1)) },
                    qualityRisk: 'Low — remaining lines operate at normal parameters'
                };
                break;
            }
        }

        res.json({
            status: 'success',
            classification: 'PROJECTION — This is a simulated scenario, not a recommendation',
            scenario: {
                scenarioId,
                type: type.toUpperCase(),
                ...result,
                confidence: 'MEDIUM',
                modelVersion: 'v4.0-simulator-2.0',
                timestamp: new Date()
            }
        });

    } catch (error) {
        next(error);
    }
};
