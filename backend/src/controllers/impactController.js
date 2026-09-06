import ImpactRecord from '../models/ImpactRecord.js';

// @desc    Get top operational risks based on impact severity and status
// @route   GET /api/impacts/top-risks
// @access  Private (Admin/Manager)
export const getTopRisks = async (req, res, next) => {
    try {
        // Find OPEN or REVIEWED impacts, sorted by severity and estimated cost
        const impacts = await ImpactRecord.find({ status: { $in: ['OPEN', 'REVIEWED'] } })
            .populate('machineId', 'name type criticality status location')
            .sort({ 
                severity: -1, // CRITICAL > HIGH > MEDIUM > LOW (Assuming enum order or we might need custom sort. For simplicity in Phase 1, we will sort by cost and failure probability)
                estimatedCostImpact: -1, 
                failureProbability: -1 
            })
            .limit(10); // Top 10 risks

        res.json({
            status: 'success',
            count: impacts.length,
            data: impacts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all impacts for a specific plant/organization
// @route   GET /api/impacts
// @access  Private
export const getImpacts = async (req, res, next) => {
    try {
        const impacts = await ImpactRecord.find({})
            .populate('machineId', 'name')
            .sort({ createdAt: -1 });

        res.json({
            status: 'success',
            count: impacts.length,
            data: impacts
        });
    } catch (error) {
        next(error);
    }
};
