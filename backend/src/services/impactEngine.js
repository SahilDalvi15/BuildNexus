import ImpactRecord from '../models/ImpactRecord.js';
import Machine from '../models/Machine.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * The Impact Engine is the core decision-support logic that listens to major operational events
 * (e.g., machine degradation, energy anomaly) and calculates the cross-domain consequences.
 */

// Cost Assumptions (Mocked for V4.0 Phase 1)
const AVG_DOWNTIME_COST_PER_HR = 450; // $450/hr
const ENERGY_COST_PER_KWH = 0.12; // $0.12/kWh
const CO2_EMISSION_FACTOR = 0.85; // 0.85 kg CO2e per kWh

export const calculateAndStoreImpact = async (event) => {
    try {
        const { machineId, eventType, severity, metadata } = event;
        
        // 1. Fetch Machine Context
        const machine = await Machine.findById(machineId);
        if (!machine) {
            console.error(`[ImpactEngine] Machine ${machineId} not found for event processing.`);
            return;
        }

        console.log(`[ImpactEngine] Processing ${eventType} for Machine: ${machine.name}`);

        // 2. Initialize Impact Record Variables
        let estimatedDowntimeHours = 0;
        let estimatedProductionLossUnits = 0;
        let energyDeviationPercent = 0;
        let estimatedExcessEnergyKwh = 0;
        let failureProbability = 0;
        
        const evidence = [];
        const assumptions = [];

        // 3. Process Specific Event Types (Simulated Intelligence Logic)
        if (eventType === 'MACHINE_DEGRADATION') {
            failureProbability = metadata.anomalyScore || 0.75; // Derived from ML model
            
            // Criticality dictates downtime impact
            if (machine.criticality === 'High') {
                estimatedDowntimeHours = 8;
                estimatedProductionLossUnits = 5000;
            } else {
                estimatedDowntimeHours = 4;
                estimatedProductionLossUnits = 1200;
            }
            
            energyDeviationPercent = 5.2; // Bearing wear increases friction, thus energy
            estimatedExcessEnergyKwh = machine.powerRating * (energyDeviationPercent / 100) * 24; // 24hr projection

            evidence.push(`ML Model detected high degradation risk (Score: ${failureProbability.toFixed(2)})`);
            evidence.push(`Vibration signature matches late-stage bearing failure.`);
            assumptions.push(`Downtime estimated based on historical MTTR for ${machine.type} assets.`);
        } 
        else if (eventType === 'ENERGY_ANOMALY') {
            energyDeviationPercent = metadata.deviation || 15.5;
            estimatedExcessEnergyKwh = machine.powerRating * (energyDeviationPercent / 100) * 48; // 48hr projection
            failureProbability = 0.10;
            
            evidence.push(`Energy baseline deviation of ${energyDeviationPercent}% detected over last 4 hours.`);
            assumptions.push(`Excess energy calculated based on 48h resolution window.`);
        }

        // 4. Calculate Cross-Domain Financial & Environmental Impacts
        const estimatedCostImpact = (estimatedDowntimeHours * AVG_DOWNTIME_COST_PER_HR) + (estimatedExcessEnergyKwh * ENERGY_COST_PER_KWH);
        const estimatedCarbonImpactTCO2e = (estimatedExcessEnergyKwh * CO2_EMISSION_FACTOR) / 1000;

        // 5. Generate Recommendation
        let recommendation = { type: 'NO_ACTION', priority: 'LOW' };
        if (failureProbability > 0.6) {
            recommendation = { type: 'SCHEDULE_MAINTENANCE', priority: 'HIGH' };
        } else if (energyDeviationPercent > 10) {
            recommendation = { type: 'INSPECT_EQUIPMENT', priority: 'MEDIUM' };
        }

        // 6. Save Impact Record
        const impactId = `IMP-${uuidv4().substring(0, 8).toUpperCase()}`;
        
        const newImpact = new ImpactRecord({
            impactId,
            eventId: event.eventId || `EVT-${uuidv4()}`,
            machineId: machine._id,
            plantId: machine.plantId,
            eventType,
            severity,
            failureProbability,
            estimatedDowntimeHours,
            estimatedProductionLossUnits,
            energyDeviationPercent,
            estimatedExcessEnergyKwh,
            estimatedCostImpact,
            estimatedCarbonImpactTCO2e,
            recommendation,
            evidence,
            assumptions,
            classification: {
                productionImpact: 'ESTIMATED',
                energyImpact: 'ESTIMATED',
                carbonImpact: 'ESTIMATED',
                costImpact: 'ESTIMATED'
            }
        });

        await newImpact.save();
        console.log(`[ImpactEngine] Impact ${impactId} successfully generated for ${machine.name}`);
        
        return newImpact;

    } catch (error) {
        console.error('[ImpactEngine] Error calculating impact:', error);
    }
};
