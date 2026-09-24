import ProductionBatch from '../models/ProductionBatch.js';
import QualityResult from '../models/QualityResult.js';

// @desc    Get batch traceability
// @route   GET /api/quality/traceability/:batchId
// @access  Private
export const getBatchTraceability = async (req, res, next) => {
    try {
        const batchId = req.params.batchId;

        // Find the batch and populate references
        const batch = await ProductionBatch.findById(batchId)
            .populate('lineId', 'name')
            .populate('operatorId', 'username email');

        if (!batch) {
            return res.status(404).json({ message: 'Production batch not found' });
        }

        // Find all quality results for this batch
        const qualityResults = await QualityResult.find({ batchId: batch._id })
            .populate('machineId', 'name type')
            .populate('inspectorId', 'username')
            .sort({ timestamp: -1 });

        // Calculate summary metrics
        const summary = {
            totalInspections: qualityResults.length,
            passed: qualityResults.filter(r => r.status === 'PASS').length,
            failed: qualityResults.filter(r => r.status === 'FAIL').length,
            reworked: qualityResults.filter(r => r.status === 'REWORK').length
        };

        res.json({
            batch,
            summary,
            qualityResults
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Record a quality result
// @route   POST /api/quality/results
// @access  Private
export const recordQualityResult = async (req, res, next) => {
    try {
        const { batchId, machineId, status, defectCategory, measurements, aiConfidenceScore } = req.body;
        
        const resultId = `QR-${Date.now()}`;

        const qualityResult = await QualityResult.create({
            resultId,
            batchId,
            machineId,
            status,
            defectCategory,
            measurements,
            aiConfidenceScore,
            inspectorId: req.user?._id
        });

        // Update batch counts
        const batch = await ProductionBatch.findById(batchId);
        if (batch) {
            batch.actualQuantity += 1;
            if (status === 'PASS') {
                batch.goodQuantity += 1;
            } else if (status === 'FAIL') {
                batch.scrapQuantity += 1;
            }
            await batch.save();
        }

        res.status(201).json(qualityResult);
    } catch (error) {
        next(error);
    }
};

// @desc    Calculate embodied carbon, energy, and water penalty for a defect
// @route   POST /api/quality/defect-impact
// @access  Private
export const calculateDefectImpact = async (req, res, next) => {
    try {
        const { defectAmount = 100, unit = 'meters', productType = 'Flat Glass (6mm)' } = req.body;

        // Base embedded multipliers per unit for typical glass/building materials
        const embeddedKwhPerUnit = 5.2; 
        const embeddedWaterLitersPerUnit = 8.5;
        const embeddedMaterialKgPerUnit = 12.0;

        // Constants for conversion
        const costPerKwh = 0.12;
        const carbonKgPerKwh = 0.38;
        const costPerLiterWater = 0.002;
        const costPerKgMaterial = 0.25;

        // Calculations
        const wastedKwh = defectAmount * embeddedKwhPerUnit;
        const wastedWater = defectAmount * embeddedWaterLitersPerUnit;
        const wastedMaterial = defectAmount * embeddedMaterialKgPerUnit;

        const financialLossEnergy = wastedKwh * costPerKwh;
        const financialLossWater = wastedWater * costPerLiterWater;
        const financialLossMaterial = wastedMaterial * costPerKgMaterial;
        
        const totalFinancialPenalty = financialLossEnergy + financialLossWater + financialLossMaterial;
        const carbonPenaltyKg = wastedKwh * carbonKgPerKwh;

        res.json({
            status: 'success',
            data: {
                defectAmount,
                unit,
                productType,
                penalties: {
                    energyWastedKwh: parseFloat(wastedKwh.toFixed(1)),
                    waterWastedLiters: parseFloat(wastedWater.toFixed(1)),
                    materialWastedKg: parseFloat(wastedMaterial.toFixed(1)),
                    carbonPenaltyKgCO2e: parseFloat(carbonPenaltyKg.toFixed(1)),
                    totalFinancialPenaltyUSD: parseFloat(totalFinancialPenalty.toFixed(2)),
                    breakdown: {
                        energyLossUSD: parseFloat(financialLossEnergy.toFixed(2)),
                        waterLossUSD: parseFloat(financialLossWater.toFixed(2)),
                        materialLossUSD: parseFloat(financialLossMaterial.toFixed(2))
                    }
                }
            }
        });

    } catch (error) {
        next(error);
    }
};
