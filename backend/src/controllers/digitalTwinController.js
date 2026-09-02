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
