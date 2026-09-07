import EnergyOpportunity from '../models/EnergyOpportunity.js';
import Machine from '../models/Machine.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Energy Baseline Engine
 * Detects anomalies against expected baseline energy consumption and generates actionable opportunities.
 */

// Constants for cost/carbon calculation (Mocked for Phase 2)
const ENERGY_COST_PER_KWH = 0.12; 
const CO2_EMISSION_FACTOR = 0.85; // kg CO2e per kWh

export const evaluateEnergyBaseline = async (machineId, currentEnergyKwH, timeWindowHours = 24) => {
    try {
        const machine = await Machine.findById(machineId);
        if (!machine) return null;

        // Ensure machine has a power rating, fallback to default if missing
        const powerRating = machine.specifications?.powerRating || 15; // kW

        // Baseline Calculation: Assume machine runs at 70% load on average during this time window
        const baselineKwh = powerRating * 0.70 * timeWindowHours;

        // Calculate Deviation
        const deviationKwh = currentEnergyKwH - baselineKwh;
        const deviationPercent = (deviationKwh / baselineKwh) * 100;

        // If deviation is positive and greater than 10%, we have an anomaly/opportunity
        if (deviationPercent > 10) {
            console.log(`[EnergyEngine] Anomaly detected for ${machine.name}: +${deviationPercent.toFixed(2)}% over baseline.`);

            // Categorize the type of opportunity
            let type = 'PROCESS_DEVIATION';
            let recommendation = 'Investigate process parameters for optimization.';
            
            if (machine.currentStatus === 'IDLE' || machine.currentStatus === 'OFFLINE') {
                type = 'IDLE_CONSUMPTION';
                recommendation = 'Power down equipment fully during non-production hours.';
            } else if (deviationPercent > 25) {
                type = 'ABNORMAL_SPIKE';
                recommendation = 'Immediate inspection required: Potential electrical fault or friction load.';
            } else if (machine.specifications?.expectedLifespan && new Date().getFullYear() - new Date(machine.installationDate).getFullYear() > 10) {
                type = 'INEFFICIENT_ASSET';
                recommendation = 'Consider upgrading motor/drives to high-efficiency modern equivalents.';
            }

            // Estimate savings if we eliminate the deviation
            const estimatedEnergySavingsKwh = deviationKwh;
            const estimatedCostSavings = estimatedEnergySavingsKwh * ENERGY_COST_PER_KWH;
            const estimatedCo2Reduction = estimatedEnergySavingsKwh * CO2_EMISSION_FACTOR;

            const evidence = [
                `Expected baseline for ${timeWindowHours}h: ${baselineKwh.toFixed(1)} kWh.`,
                `Actual consumption: ${currentEnergyKwH.toFixed(1)} kWh.`,
                `Deviation: +${deviationPercent.toFixed(1)}%.`
            ];

            const opportunityId = `OPP-${uuidv4().substring(0, 8).toUpperCase()}`;

            const newOpportunity = new EnergyOpportunity({
                opportunityId,
                machineId: machine._id,
                title: `Reduce ${type.replace('_', ' ').toLowerCase()} on ${machine.name}`,
                type,
                baselineKwh,
                actualKwh: currentEnergyKwH,
                deviationPercent,
                estimatedEnergySavingsKwh,
                estimatedCostSavings,
                estimatedCo2Reduction,
                confidence: 'MEDIUM',
                evidence,
                recommendation,
                status: 'OPEN'
            });

            await newOpportunity.save();
            return newOpportunity;
        }

        return null;

    } catch (error) {
        console.error('[EnergyEngine] Error evaluating baseline:', error);
        return null;
    }
};

/**
 * Utility function to seed some realistic energy opportunities for demonstration purposes in V4.0.
 */
export const seedMockOpportunities = async () => {
    try {
        const count = await EnergyOpportunity.countDocuments();
        if (count > 0) return; // Only seed if empty

        const machines = await Machine.find().limit(3);
        if (machines.length === 0) return;

        console.log('[EnergyEngine] Seeding initial energy opportunities...');

        const mockData = [
            { machine: machines[0], actual: 480, hours: 24, status: 'ONLINE' },
            { machine: machines[1], actual: 120, hours: 12, status: 'IDLE' }, // High idle
            { machine: machines[2] || machines[0], actual: 950, hours: 48, status: 'ONLINE' } // Spike
        ];

        for (const data of mockData) {
            // Temporarily set machine status to trigger specific logic
            const originalStatus = data.machine.currentStatus;
            data.machine.currentStatus = data.status;
            await evaluateEnergyBaseline(data.machine._id, data.actual, data.hours);
            data.machine.currentStatus = originalStatus;
        }
    } catch (error) {
        console.error('[EnergyEngine] Error seeding opportunities:', error);
    }
};
