import SensorReading from '../models/SensorReading.js';
import EnergyOpportunity from '../models/EnergyOpportunity.js';
import MaterialBatch from '../models/MaterialBatch.js';
import WasteStream from '../models/WasteStream.js';
import WaterReading from '../models/WaterReading.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Multi-Objective Optimizer Engine (PRD Section 25)
 * 
 * Evaluates current plant state and generates ranked optimization scenarios
 * across six dimensions: Production, Energy, Carbon, Cost, Downtime, Quality.
 */

const getPlantBaseline = async () => {
  // Aggregate current energy state
  const energyResult = await SensorReading.aggregate([
    { $group: { _id: null, totalEnergyKwH: { $sum: '$energyConsumption' }, count: { $sum: 1 } } }
  ]);
  const totalEnergy = energyResult.length > 0 ? energyResult[0].totalEnergyKwH : 10000;

  // Get open energy opportunities (potential savings)
  const energyOpps = await EnergyOpportunity.find({ status: { $in: ['OPEN', 'REVIEWED'] } });
  const totalEnergySavings = energyOpps.reduce((sum, o) => sum + o.estimatedEnergySavingsKwh, 0);

  // Get material stats
  const matStats = await MaterialBatch.aggregate([
    { $group: { _id: null, avgYield: { $avg: '$materialYield' }, avgScrap: { $avg: '$scrapPercent' }, avgRecycled: { $avg: '$recycledMaterialPercent' } } }
  ]);
  const materialData = matStats.length > 0 ? matStats[0] : { avgYield: 94, avgScrap: 5.5, avgRecycled: 30 };

  // Get waste recovery potential
  const wasteStreams = await WasteStream.find({ recoverability: 'RECOVERABLE' });
  const recoverableWasteKg = wasteStreams.reduce((sum, w) => sum + w.quantity, 0);

  // Get water stats
  const waterStats = await WaterReading.aggregate([
    { $group: { _id: null, avgReuse: { $avg: '$reusePercentage' }, totalConsumption: { $sum: '$totalConsumptionM3' } } }
  ]);
  const waterData = waterStats.length > 0 ? waterStats[0] : { avgReuse: 12, totalConsumption: 1200 };

  return {
    totalEnergy,
    totalEnergySavings,
    materialYield: materialData.avgYield,
    scrapPercent: materialData.avgScrap,
    recycledPercent: materialData.avgRecycled,
    recoverableWasteKg,
    waterReusePercent: waterData.avgReuse,
    waterConsumption: waterData.totalConsumption
  };
};

export const generateOptimizationScenarios = async () => {
  const baseline = await getPlantBaseline();
  const COST_PER_KWH = 0.12;
  const CO2_PER_KWH = 0.38;

  // Current state (normalized to 100%)
  const current = {
    scenarioId: `SCN-CURRENT`,
    name: 'Current State',
    production: 100,
    energy: 100,
    carbon: 100,
    cost: 100,
    downtime: 100,
    quality: 100,
    risk: 'Baseline',
    actions: [],
    confidence: 'HIGH'
  };

  // Scenario A: Energy Optimization Focus
  const energySavingPercent = baseline.totalEnergySavings > 0
    ? Math.min((baseline.totalEnergySavings / baseline.totalEnergy) * 100, 15)
    : 6;

  const scenarioA = {
    scenarioId: `SCN-${uuidv4().substring(0, 6).toUpperCase()}`,
    name: 'Energy Optimization',
    production: 100,
    energy: parseFloat((100 - energySavingPercent).toFixed(1)),
    carbon: parseFloat((100 - energySavingPercent * 0.97).toFixed(1)),
    cost: parseFloat((100 - energySavingPercent * 0.85).toFixed(1)),
    downtime: 100,
    quality: 100,
    risk: 'Low',
    actions: [
      'Eliminate idle energy consumption across flagged assets',
      'Address abnormal energy spikes via predictive maintenance',
      'Optimize process parameters on high-deviation machines'
    ],
    confidence: 'HIGH',
    estimatedSavingsUSD: parseFloat((baseline.totalEnergySavings * COST_PER_KWH).toFixed(0)),
    estimatedCO2ReductionKg: parseFloat((baseline.totalEnergySavings * CO2_PER_KWH).toFixed(0))
  };

  // Scenario B: Material & Waste Circularity Focus
  const yieldImprovement = Math.min(100 - baseline.materialYield, 3); // Max 3% improvement
  const scenarioB = {
    scenarioId: `SCN-${uuidv4().substring(0, 6).toUpperCase()}`,
    name: 'Circularity & Material Optimization',
    production: parseFloat((100 + yieldImprovement * 0.5).toFixed(1)),
    energy: 97,
    carbon: parseFloat((100 - (baseline.recoverableWasteKg * 0.62 / (baseline.totalEnergy * CO2_PER_KWH)) * 100).toFixed(1)),
    cost: parseFloat((100 - yieldImprovement * 1.2).toFixed(1)),
    downtime: 100,
    quality: parseFloat((100 + yieldImprovement * 0.3).toFixed(1)),
    risk: 'Medium',
    actions: [
      `Increase recycled material input from ${baseline.recycledPercent.toFixed(0)}% toward ${Math.min(baseline.recycledPercent + 8, 60).toFixed(0)}%`,
      `Recover ${(baseline.recoverableWasteKg * 0.45).toFixed(0)} kg/day from waste streams`,
      'Reduce scrap rate through process parameter optimization'
    ],
    confidence: 'MEDIUM'
  };

  // Scenario C: Aggressive Combined Optimization
  const scenarioC = {
    scenarioId: `SCN-${uuidv4().substring(0, 6).toUpperCase()}`,
    name: 'Aggressive Combined Optimization',
    production: parseFloat((100 - 2).toFixed(1)),
    energy: parseFloat((100 - energySavingPercent - 5).toFixed(1)),
    carbon: parseFloat((100 - energySavingPercent - 8).toFixed(1)),
    cost: parseFloat((100 - energySavingPercent * 1.5).toFixed(1)),
    downtime: parseFloat((100 + 3).toFixed(1)),
    quality: 100,
    risk: 'Medium-High',
    actions: [
      'All actions from Scenario A (Energy)',
      'All actions from Scenario B (Circularity)',
      'Increase planned maintenance windows for energy-inefficient assets',
      `Increase water reuse from ${baseline.waterReusePercent.toFixed(0)}% to ${Math.min(baseline.waterReusePercent + 10, 35).toFixed(0)}%`
    ],
    confidence: 'MEDIUM'
  };

  return {
    generatedAt: new Date(),
    baseline: {
      totalEnergyKwH: baseline.totalEnergy,
      materialYield: baseline.materialYield,
      recycledPercent: baseline.recycledPercent,
      recoverableWasteKg: baseline.recoverableWasteKg,
      waterReusePercent: baseline.waterReusePercent
    },
    scenarios: [current, scenarioA, scenarioB, scenarioC]
  };
};

/**
 * Decarbonization Roadmap Simulator (PRD Section 28)
 */
export const generateDecarbRoadmap = async (targetReductionPercent) => {
  const baseline = await getPlantBaseline();
  const CO2_PER_KWH = 0.38;

  const currentEmissionsKg = baseline.totalEnergy * CO2_PER_KWH;
  const targetEmissionsKg = currentEmissionsKg * (1 - targetReductionPercent / 100);
  const reductionNeededKg = currentEmissionsKg - targetEmissionsKg;

  // Evaluate levers
  const levers = [];
  let projectedReductionKg = 0;

  // Lever 1: Energy Efficiency
  const energyEffReduction = baseline.totalEnergySavings * CO2_PER_KWH;
  projectedReductionKg += energyEffReduction;
  levers.push({
    name: 'Energy Efficiency',
    category: 'Energy',
    reductionKg: parseFloat(energyEffReduction.toFixed(0)),
    reductionPercent: parseFloat(((energyEffReduction / currentEmissionsKg) * 100).toFixed(1)),
    estimatedCostUSD: parseFloat((baseline.totalEnergySavings * 0.02).toFixed(0)),
    estimatedSavingsUSD: parseFloat((baseline.totalEnergySavings * 0.12).toFixed(0)),
    paybackMonths: 6,
    priority: 'HIGH',
    actions: ['Address idle consumption', 'Fix energy anomalies', 'Optimize high-deviation assets']
  });

  // Lever 2: Waste Recovery
  const wasteRecoveryReduction = baseline.recoverableWasteKg * 0.45 * 0.62;
  projectedReductionKg += wasteRecoveryReduction;
  levers.push({
    name: 'Waste Recovery',
    category: 'Circularity',
    reductionKg: parseFloat(wasteRecoveryReduction.toFixed(0)),
    reductionPercent: parseFloat(((wasteRecoveryReduction / currentEmissionsKg) * 100).toFixed(1)),
    estimatedCostUSD: 1200,
    estimatedSavingsUSD: parseFloat((baseline.recoverableWasteKg * 0.45 * 0.08).toFixed(0)),
    paybackMonths: 14,
    priority: 'MEDIUM',
    actions: ['Implement internal reuse for glass cullet', 'Partner with recycling operators for metal scrap']
  });

  // Lever 3: Material Optimization (increase recycled content)
  const materialReduction = baseline.totalEnergy * 0.02 * CO2_PER_KWH;
  projectedReductionKg += materialReduction;
  levers.push({
    name: 'Recycled Content Increase',
    category: 'Materials',
    reductionKg: parseFloat(materialReduction.toFixed(0)),
    reductionPercent: parseFloat(((materialReduction / currentEmissionsKg) * 100).toFixed(1)),
    estimatedCostUSD: 3500,
    estimatedSavingsUSD: 800,
    paybackMonths: 24,
    priority: 'LOW',
    actions: ['Evaluate engineering feasibility for +8% recycled input', 'Qualify alternative suppliers']
  });

  const projectedEmissionsKg = currentEmissionsKg - projectedReductionKg;
  const gapKg = Math.max(targetEmissionsKg - projectedEmissionsKg, 0);

  return {
    roadmapId: `ROAD-${uuidv4().substring(0, 6).toUpperCase()}`,
    generatedAt: new Date(),
    targetReductionPercent,
    currentEmissionsTCO2e: parseFloat((currentEmissionsKg / 1000).toFixed(2)),
    targetEmissionsTCO2e: parseFloat((targetEmissionsKg / 1000).toFixed(2)),
    projectedEmissionsTCO2e: parseFloat((projectedEmissionsKg / 1000).toFixed(2)),
    gapTCO2e: parseFloat((gapKg / 1000).toFixed(2)),
    gapClosed: gapKg <= 0,
    levers,
    totalEstimatedCostUSD: levers.reduce((s, l) => s + l.estimatedCostUSD, 0),
    totalEstimatedSavingsUSD: levers.reduce((s, l) => s + l.estimatedSavingsUSD, 0),
    classification: 'PROJECTED — Requires engineering and business validation'
  };
};
