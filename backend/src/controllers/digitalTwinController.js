import Plant from '../models/Plant.js';
import PlantZone from '../models/PlantZone.js';
import ProductionLine from '../models/ProductionLine.js';
import Machine from '../models/Machine.js';

// @desc    Get complete hierarchical spatial layout for digital twin
// @route   GET /api/digital-twin/layout/:plantId
// @access  Private
export const getDigitalTwinLayout = async (req, res, next) => {
    try {
        const { plantId } = req.params;

        const plant = await Plant.findOne({ plantId });
        if (!plant) {
            return res.status(404).json({ message: 'Plant not found' });
        }

        // Fetch all components for the plant
        const zones = await PlantZone.find({ plantId: plant._id }).lean();
        const lines = await ProductionLine.find({ plantId: plant._id }).lean();
        const machines = await Machine.find({ plantId: plant._id }).lean();

        // Nest machines into lines and zones
        const layout = {
            plant: {
                id: plant.plantId,
                name: plant.name,
                location: plant.location
            },
            zones: zones.map(zone => {
                // Find machines explicitly in this zone but not in a line
                const zoneMachines = machines.filter(m => 
                    m.zoneId?.toString() === zone._id.toString() && !m.productionLine
                );

                // Find lines in this zone
                const zoneLines = lines.filter(line => 
                    line.zoneId?.toString() === zone._id.toString()
                ).map(line => {
                    const lineMachines = machines.filter(m => 
                        m.productionLine?.toString() === line._id.toString()
                    );
                    return {
                        ...line,
                        machines: lineMachines
                    };
                });

                return {
                    ...zone,
                    lines: zoneLines,
                    standaloneMachines: zoneMachines
                };
            })
        };

        // Also append machines that have no zone assigned (Unassigned)
        const unassignedMachines = machines.filter(m => !m.zoneId && !m.productionLine);
        if (unassignedMachines.length > 0) {
            layout.unassignedMachines = unassignedMachines;
        }

        res.json(layout);
    } catch (error) {
        next(error);
    }
};

// @desc    Simulate Furnace Fuel Switching (Natural Gas vs Hydrogen/Electric)
// @route   POST /api/digital-twin/furnace-simulator
// @access  Private
export const simulateFurnaceFuel = async (req, res, next) => {
    try {
        const { currentGasPercent = 100, targetGasPercent = 70, targetHydrogenPercent = 30, dailyEnergyMwh = 500 } = req.body;

        // Base assumptions for high-temp glass furnace
        const COST_NATURAL_GAS_PER_MWH = 35; // USD
        const COST_HYDROGEN_PER_MWH = 120; // USD (Green hydrogen is currently expensive)
        const EMISSIONS_NATURAL_GAS_KG_PER_MWH = 202; // kg CO2 per MWh
        const EMISSIONS_HYDROGEN_KG_PER_MWH = 0; // Green hydrogen at point of combustion

        // Current state
        const currentGasMwh = dailyEnergyMwh * (currentGasPercent / 100);
        const currentCost = currentGasMwh * COST_NATURAL_GAS_PER_MWH;
        const currentEmissions = currentGasMwh * EMISSIONS_NATURAL_GAS_KG_PER_MWH;

        // Target state
        const targetGasMwh = dailyEnergyMwh * (targetGasPercent / 100);
        const targetHydrogenMwh = dailyEnergyMwh * (targetHydrogenPercent / 100);
        
        const targetCost = (targetGasMwh * COST_NATURAL_GAS_PER_MWH) + (targetHydrogenMwh * COST_HYDROGEN_PER_MWH);
        const targetEmissions = (targetGasMwh * EMISSIONS_NATURAL_GAS_KG_PER_MWH) + (targetHydrogenMwh * EMISSIONS_HYDROGEN_KG_PER_MWH);

        // Impact
        const costIncreaseDaily = targetCost - currentCost;
        const emissionsReducedDaily = currentEmissions - targetEmissions;

        res.json({
            status: 'success',
            data: {
                simulationId: `FURNACE-${Date.now()}`,
                inputs: {
                    currentGasPercent,
                    targetGasPercent,
                    targetHydrogenPercent,
                    dailyEnergyMwh
                },
                impact: {
                    currentDailyCostUSD: parseFloat(currentCost.toFixed(2)),
                    targetDailyCostUSD: parseFloat(targetCost.toFixed(2)),
                    costIncreaseDailyUSD: parseFloat(costIncreaseDaily.toFixed(2)),
                    
                    currentDailyEmissionsKg: parseFloat(currentEmissions.toFixed(2)),
                    targetDailyEmissionsKg: parseFloat(targetEmissions.toFixed(2)),
                    emissionsReducedDailyKg: parseFloat(emissionsReducedDaily.toFixed(2)),
                    
                    carbonReductionPercent: parseFloat(((emissionsReducedDaily / currentEmissions) * 100).toFixed(1)),
                    costPremiumPercent: parseFloat(((costIncreaseDaily / currentCost) * 100).toFixed(1))
                },
                annualized: {
                    carbonReducedTons: parseFloat(((emissionsReducedDaily * 350) / 1000).toFixed(1)),
                    costPremiumUSD: parseFloat((costIncreaseDaily * 350).toFixed(0))
                }
            }
        });
    } catch (error) {
        next(error);
    }
};
