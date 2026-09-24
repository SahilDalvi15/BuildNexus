import DecarbInitiative from '../models/DecarbInitiative.js';
import { v4 as uuidv4 } from 'uuid';

// @desc    Get roadmap overview and initiatives
// @route   GET /api/decarbonization
// @access  Private
export const getDecarbRoadmap = async (req, res, next) => {
  try {
    // Seed initial mock initiatives if none exist
    const count = await DecarbInitiative.countDocuments();
    if (count === 0) {
      console.log('[DecarbController] Seeding mock roadmap...');
      const initiatives = [
        {
          initiativeId: `DI-${uuidv4().substring(0, 6).toUpperCase()}`,
          title: 'Upgrade Plant 1 Furnaces to Hydrogen Blend',
          category: 'LOW_CARBON_FUEL',
          description: 'Transition main glass furnaces from 100% natural gas to 30% Green Hydrogen blend.',
          timeline: { proposedYear: 2026, targetCompletionYear: 2028 },
          financials: { estimatedCapexUSD: 4500000, estimatedAnnualSavingsUSD: -120000, roiYears: 0 },
          carbonImpact: { estimatedAnnualReductionTons: 12500, verifiedAnnualReductionTons: 0 },
          status: 'EVALUATING'
        },
        {
          initiativeId: `DI-${uuidv4().substring(0, 6).toUpperCase()}`,
          title: 'Solar PV Installation (Rooftop Phase 1)',
          category: 'RENEWABLE_ELECTRICITY',
          description: 'Install 5MW rooftop solar array to offset grid electricity.',
          timeline: { proposedYear: 2025, targetCompletionYear: 2026 },
          financials: { estimatedCapexUSD: 3500000, estimatedAnnualSavingsUSD: 450000, roiYears: 7.8 },
          carbonImpact: { estimatedAnnualReductionTons: 4100, verifiedAnnualReductionTons: 0 },
          status: 'IN_PROGRESS'
        },
        {
          initiativeId: `DI-${uuidv4().substring(0, 6).toUpperCase()}`,
          title: 'Increase Recycled Cullet to 45%',
          category: 'RECYCLED_MATERIALS',
          description: 'Optimize material batching to increase recycled glass cullet usage, reducing virgin material melting energy.',
          timeline: { proposedYear: 2024, targetCompletionYear: 2025, actualCompletionDate: new Date('2025-01-15') },
          financials: { estimatedCapexUSD: 500000, estimatedAnnualSavingsUSD: 850000, roiYears: 0.6 },
          carbonImpact: { estimatedAnnualReductionTons: 6200, verifiedAnnualReductionTons: 6150 },
          status: 'VERIFIED'
        },
        {
          initiativeId: `DI-${uuidv4().substring(0, 6).toUpperCase()}`,
          title: 'Compressor Network Optimization & VFD Upgrades',
          category: 'ENERGY_EFFICIENCY',
          description: 'Replace fixed-speed compressors with VFDs and implement intelligent staging.',
          timeline: { proposedYear: 2025, targetCompletionYear: 2026 },
          financials: { estimatedCapexUSD: 250000, estimatedAnnualSavingsUSD: 110000, roiYears: 2.3 },
          carbonImpact: { estimatedAnnualReductionTons: 850, verifiedAnnualReductionTons: 0 },
          status: 'APPROVED'
        }
      ];
      await DecarbInitiative.insertMany(initiatives);
    }

    const baselineEmissionsTons = 150000;
    const targetEmissionsTons = 75000;
    const targetYear = 2030;

    const items = await DecarbInitiative.find().sort({ 'timeline.proposedYear': 1 });

    let totalEstimatedReduction = 0;
    let totalVerifiedReduction = 0;

    items.forEach(item => {
      totalEstimatedReduction += item.carbonImpact.estimatedAnnualReductionTons || 0;
      totalVerifiedReduction += item.carbonImpact.verifiedAnnualReductionTons || 0;
    });

    res.json({
      status: 'success',
      data: {
        roadmap: {
          baselineEmissionsTons,
          targetEmissionsTons,
          targetYear,
          currentEmissionsTons: baselineEmissionsTons - totalVerifiedReduction,
          totalEstimatedReduction,
          totalVerifiedReduction,
          gapToTargetTons: (baselineEmissionsTons - targetEmissionsTons) - totalEstimatedReduction
        },
        initiatives: items
      }
    });

  } catch (error) {
    next(error);
  }
};
