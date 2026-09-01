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
