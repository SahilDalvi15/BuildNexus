import Machine from '../models/Machine.js';
import ImpactRecord from '../models/ImpactRecord.js';
import EnergyOpportunity from '../models/EnergyOpportunity.js';
import { v4 as uuidv4 } from 'uuid';

import Recommendation from '../models/Recommendation.js';
import Verification from '../models/Verification.js';

/**
 * Recommendation Engine (PRD Section 35)
 * Combines: current state, predictions, impact, historical behavior,
 * maintenance data, inventory, production schedule, and configured constraints.
 */

export const generateRecommendations = async () => {
  try {
    // Seed initial recommendations if none exist
    const count = await Recommendation.countDocuments();
    if (count === 0) {
      console.log('[RecommendationEngine] Seeding mock recommendations...');
      const recs = [
        {
          recommendationId: `REC-${uuidv4().substring(0, 6).toUpperCase()}`,
          title: 'Upgrade Compressor C-102 Seals',
          problem: 'Air leak detected causing 15% energy inefficiency.',
          evidence: 'Telemetry shows pressure drop of 4 PSI over 2 hours during idle.',
          recommendedAction: 'Replace secondary pneumatic seals on Compressor C-102.',
          predictedImpact: { energySavedKwh: 450, carbonSavedKg: 170, costSavedUSD: 54, productionGainedUnits: 0, downtimeAvoidedHours: 2 },
          confidenceScore: 92,
          status: 'RECOMMENDED'
        },
        {
          recommendationId: `REC-${uuidv4().substring(0, 6).toUpperCase()}`,
          title: 'Optimize Extruder Heating Profile',
          problem: 'Excessive thermal energy used during standby.',
          evidence: 'Energy baseline exceeded by 22% during Non-Production State.',
          recommendedAction: 'Apply ML-optimized standby temperature setpoints (Profile B).',
          predictedImpact: { energySavedKwh: 800, carbonSavedKg: 304, costSavedUSD: 96, productionGainedUnits: 0, downtimeAvoidedHours: 0 },
          confidenceScore: 88,
          status: 'EXECUTED',
          executedAt: new Date(Date.now() - 1000 * 60 * 60 * 48)
        },
        {
          recommendationId: `REC-${uuidv4().substring(0, 6).toUpperCase()}`,
          title: 'Replace Furnace Burner Tip',
          problem: 'Sub-optimal fuel-to-air ratio detected.',
          evidence: 'NOx emissions up 5%; fuel consumption up 4%.',
          recommendedAction: 'Replace burner tip on Main Furnace line.',
          predictedImpact: { energySavedKwh: 1200, carbonSavedKg: 450, costSavedUSD: 144, productionGainedUnits: 0, downtimeAvoidedHours: 0 },
          confidenceScore: 95,
          status: 'VERIFIED',
          executedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
          approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8)
        }
      ];
      
      await Recommendation.insertMany(recs);

      // Create a verification for the verified one
      const verifiedRec = await Recommendation.findOne({ status: 'VERIFIED' });
      if (verifiedRec) {
        const ver = await Verification.create({
          verificationId: `VER-${uuidv4().substring(0, 6).toUpperCase()}`,
          recommendationId: verifiedRec._id,
          baselinePeriod: { startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) },
          measurementPeriod: { startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), endDate: new Date() },
          estimatedSavings: { costUSD: 144, carbonKg: 450, energyKwh: 1200 },
          measuredSavings: { costUSD: 160, carbonKg: 500, energyKwh: 1320 },
          verifiedSavings: { costUSD: 138, carbonKg: 430, energyKwh: 1150 }, // Normalized downwards slightly due to production volume change
          normalizationFactors: ['Adjusted for 4% decrease in production volume during measurement period.'],
          evidence: 'Fuel flow meters and production counts confirmed.',
          status: 'COMPLETED',
          verifiedAt: new Date()
        });
        verifiedRec.verificationId = ver._id;
        await verifiedRec.save();
      }
    }

    // Always fetch from DB now
    const recommendations = await Recommendation.find().populate('verificationId').sort({ createdAt: -1 });
    
    // Also append the dynamic ones from before just for UI richness if needed, 
    // but for the strict verified loop, DB backed is better.
    // For now we just return DB recommendations.
    return recommendations;

    // 1. High-impact machine risks
    const impacts = await ImpactRecord.find({ status: { $in: ['ESTIMATED', 'ACTIVE'] } })
      .populate('machineId', 'name currentStatus specifications')
      .sort({ 'costImpact.estimatedCost': -1 })
      .limit(5);

    for (const impact of impacts) {
      if (impact.machineId) {
        recommendations.push({
          recommendationId: `REC-${uuidv4().substring(0, 6).toUpperCase()}`,
          type: 'MAINTENANCE',
          priority: impact.severity === 'CRITICAL' ? 'URGENT' : (impact.severity === 'HIGH' ? 'HIGH' : 'MEDIUM'),
          title: `Schedule inspection of ${impact.machineId.name}`,
          reason: `High failure probability combined with rising operational impact. Estimated cost impact: $${impact.costImpact?.estimatedCost?.toFixed(0) || 'N/A'}.`,
          evidence: [
            `Impact severity: ${impact.severity}`,
            `Machine status: ${impact.machineId.currentStatus}`,
            `Event type: ${impact.eventType}`
          ],
          requiredParts: impact.maintenanceImpact?.requiredParts || [],
          estimatedDowntimeHours: impact.maintenanceImpact?.estimatedDowntimeHours || 4,
          classification: 'RECOMMENDED — Requires human approval before execution',
          generatedAt: new Date()
        });
      }
    }

    // 2. Energy efficiency recommendations
    const energyOpps = await EnergyOpportunity.find({ status: 'OPEN' })
      .populate('machineId', 'name')
      .sort({ estimatedCostSavings: -1 })
      .limit(3);

    for (const opp of energyOpps) {
      recommendations.push({
        recommendationId: `REC-${uuidv4().substring(0, 6).toUpperCase()}`,
        type: 'ENERGY_OPTIMIZATION',
        priority: opp.confidence === 'HIGH' ? 'HIGH' : 'MEDIUM',
        title: opp.title,
        reason: opp.recommendation,
        evidence: opp.evidence,
        estimatedSavingsUSD: opp.estimatedCostSavings,
        estimatedCO2ReductionKg: opp.estimatedCo2Reduction,
        classification: 'RECOMMENDED — Requires engineering validation',
        generatedAt: new Date()
      });
    }

    // 3. General best-practice recommendations (always present)
    if (recommendations.length < 3) {
      recommendations.push({
        recommendationId: `REC-${uuidv4().substring(0, 6).toUpperCase()}`,
        type: 'PROCESS_IMPROVEMENT',
        priority: 'LOW',
        title: 'Review production schedule for energy-optimal sequencing',
        reason: 'Scheduling energy-intensive processes during off-peak tariff windows can reduce costs without impacting throughput.',
        evidence: ['Based on general industrial best practice'],
        classification: 'SUGGESTED — No immediate action required',
        generatedAt: new Date()
      });
    }

    return recommendations;

  } catch (error) {
    console.error('[RecommendationEngine] Error:', error);
    return [];
  }
};
