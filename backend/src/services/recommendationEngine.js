import Machine from '../models/Machine.js';
import ImpactRecord from '../models/ImpactRecord.js';
import EnergyOpportunity from '../models/EnergyOpportunity.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Recommendation Engine (PRD Section 35)
 * Combines: current state, predictions, impact, historical behavior,
 * maintenance data, inventory, production schedule, and configured constraints.
 */

export const generateRecommendations = async () => {
  try {
    const recommendations = [];

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
