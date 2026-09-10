import WasteStream from '../models/WasteStream.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Waste Intelligence Engine
 * Identifies waste-to-value recovery opportunities (PRD Section 21).
 */

export const analyzeWasteOpportunities = (streams) => {
  const opportunities = [];

  for (const stream of streams) {
    if (stream.recoverability === 'RECOVERABLE' && stream.quantity > 0) {
      const recoverableKg = stream.quantity * 0.45; // Assume 45% is practically recoverable
      const materialSavingsUSD = recoverableKg * 0.08; // $0.08/kg average material value
      const co2ReductionKg = recoverableKg * 0.62; // 0.62 kgCO2e avoided per kg recovered

      opportunities.push({
        streamId: stream.streamId,
        materialType: stream.materialType,
        sourceProcess: stream.sourceProcess,
        totalWasteKg: stream.quantity,
        recoverableKg: parseFloat(recoverableKg.toFixed(1)),
        pathways: stream.recoveryPathways || ['Recycling'],
        potentialMaterialSavingsUSD: parseFloat(materialSavingsUSD.toFixed(2)),
        potentialWasteReductionKg: parseFloat(recoverableKg.toFixed(1)),
        potentialCO2ReductionKg: parseFloat(co2ReductionKg.toFixed(2)),
        confidence: recoverableKg > 500 ? 'HIGH' : (recoverableKg > 100 ? 'MEDIUM' : 'LOW')
      });
    }
  }

  return opportunities.sort((a, b) => b.potentialMaterialSavingsUSD - a.potentialMaterialSavingsUSD);
};

/**
 * Seed mock waste streams for demonstration.
 */
export const seedMockWasteStreams = async () => {
  try {
    const count = await WasteStream.countDocuments();
    if (count > 0) return;

    console.log('[WasteEngine] Seeding initial waste streams...');

    const mockStreams = [
      {
        streamId: `WS-${uuidv4().substring(0, 6).toUpperCase()}`,
        materialType: 'Glass Cullet',
        sourceProcess: 'Cutting',
        quantity: 1800,
        unit: 'kg',
        recoverability: 'RECOVERABLE',
        recoveryPathways: ['Internal Reuse', 'Recycling'],
        disposalMethod: null,
        cost: -45, // Revenue from recycling
        estimatedCarbonImpactKg: 324
      },
      {
        streamId: `WS-${uuidv4().substring(0, 6).toUpperCase()}`,
        materialType: 'Metal Scrap',
        sourceProcess: 'Forming',
        quantity: 620,
        unit: 'kg',
        recoverability: 'RECOVERABLE',
        recoveryPathways: ['Recycling', 'Alternative Material Application'],
        disposalMethod: null,
        cost: -28,
        estimatedCarbonImpactKg: 186
      },
      {
        streamId: `WS-${uuidv4().substring(0, 6).toUpperCase()}`,
        materialType: 'Chemical Sludge',
        sourceProcess: 'Finishing',
        quantity: 340,
        unit: 'kg',
        recoverability: 'DISPOSAL',
        recoveryPathways: [],
        disposalMethod: 'Licensed Incineration',
        cost: 220,
        estimatedCarbonImpactKg: 510
      },
      {
        streamId: `WS-${uuidv4().substring(0, 6).toUpperCase()}`,
        materialType: 'Plastic Film',
        sourceProcess: 'Packaging',
        quantity: 150,
        unit: 'kg',
        recoverability: 'RECOVERABLE',
        recoveryPathways: ['Recycling'],
        disposalMethod: null,
        cost: -5,
        estimatedCarbonImpactKg: 92
      }
    ];

    await WasteStream.insertMany(mockStreams);
  } catch (error) {
    console.error('[WasteEngine] Error seeding waste streams:', error);
  }
};
