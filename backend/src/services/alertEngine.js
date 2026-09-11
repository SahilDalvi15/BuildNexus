import SmartAlert from '../models/SmartAlert.js';
import Machine from '../models/Machine.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Alert Intelligence 2.0 Engine (PRD Section 34)
 */

export const calculateAlertPriority = (params) => {
  const {
    severityLevel = 5,
    failureProbability = 0,
    assetCriticality = 5,
    productionImpactFactor = 0,
    energyImpactFactor = 0,
    carbonImpactFactor = 0,
    qualityImpactFactor = 0,
    urgencyFactor = 5
  } = params;

  // Weightings for different factors
  const weights = {
    severity: 0.20,
    failureProb: 0.15,
    criticality: 0.15,
    production: 0.15,
    energy: 0.05,
    carbon: 0.05,
    quality: 0.15,
    urgency: 0.10
  };

  const rawScore = 
    (severityLevel * 10 * weights.severity) +
    (failureProbability * 100 * weights.failureProb) +
    (assetCriticality * 10 * weights.criticality) +
    (productionImpactFactor * 10 * weights.production) +
    (energyImpactFactor * 10 * weights.energy) +
    (carbonImpactFactor * 10 * weights.carbon) +
    (qualityImpactFactor * 10 * weights.quality) +
    (urgencyFactor * 10 * weights.urgency);

  const priorityScore = Math.min(Math.max(Math.round(rawScore), 0), 100);

  const explanation = [];
  if (failureProbability > 0.7) explanation.push(`High failure probability (${Math.round(failureProbability*100)}%)`);
  if (assetCriticality >= 8) explanation.push(`Critical asset (Level ${assetCriticality})`);
  if (productionImpactFactor >= 7) explanation.push(`Severe production impact predicted`);
  if (qualityImpactFactor >= 7) explanation.push(`High risk to product quality`);
  if (urgencyFactor >= 8) explanation.push(`Immediate action required`);
  if (explanation.length === 0) explanation.push(`Standard operational alert`);

  return { priorityScore, explanation };
};

export const generateMockAlerts = async () => {
  const count = await SmartAlert.countDocuments();
  if (count > 0) return;

  console.log('[AlertEngine] Seeding mock smart alerts...');
  const machines = await Machine.find().limit(3);
  if (machines.length === 0) return;

  const alerts = [
    {
      alertId: `ALT-${uuidv4().substring(0, 6).toUpperCase()}`,
      machineId: machines[0]._id,
      title: 'Predictive Failure Warning',
      message: 'Vibration anomaly detected. Bearing failure predicted within 48 hours.',
      type: 'PREDICTIVE_MAINTENANCE',
      severityLevel: 9, failureProbability: 0.85, assetCriticality: 9,
      productionImpactFactor: 8, energyImpactFactor: 4, carbonImpactFactor: 2, qualityImpactFactor: 3, urgencyFactor: 9
    },
    {
      alertId: `ALT-${uuidv4().substring(0, 6).toUpperCase()}`,
      machineId: machines[1]._id,
      title: 'Quality Deviation Risk',
      message: 'Temperature fluctuating outside of normal process bands.',
      type: 'QUALITY_RISK',
      severityLevel: 6, failureProbability: 0.2, assetCriticality: 7,
      productionImpactFactor: 4, energyImpactFactor: 5, carbonImpactFactor: 4, qualityImpactFactor: 9, urgencyFactor: 6
    },
    {
      alertId: `ALT-${uuidv4().substring(0, 6).toUpperCase()}`,
      machineId: machines[2]._id,
      title: 'Energy Spike Detected',
      message: 'Asset consuming 18% more power than baseline during idle cycle.',
      type: 'ENERGY_ANOMALY',
      severityLevel: 5, failureProbability: 0.1, assetCriticality: 5,
      productionImpactFactor: 1, energyImpactFactor: 8, carbonImpactFactor: 8, qualityImpactFactor: 1, urgencyFactor: 4
    }
  ];

  for (const a of alerts) {
    const { priorityScore, explanation } = calculateAlertPriority(a);
    a.priorityScore = priorityScore;
    a.priorityExplanation = explanation;
    await SmartAlert.create(a);
  }
};
