import { generateOptimizationScenarios, generateDecarbRoadmap } from '../services/optimizerEngine.js';

// @desc    Get multi-objective optimization scenarios
// @route   GET /api/optimizer/scenarios
// @access  Private
export const getOptimizationScenarios = async (req, res, next) => {
  try {
    const result = await generateOptimizationScenarios();
    res.json({
      status: 'success',
      classification: 'PROJECTED — All values are projections requiring validation',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate decarbonization roadmap
// @route   POST /api/optimizer/decarb-roadmap
// @access  Private
export const getDecarbRoadmap = async (req, res, next) => {
  try {
    const { targetReductionPercent } = req.body;

    if (!targetReductionPercent || targetReductionPercent < 1 || targetReductionPercent > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'targetReductionPercent must be between 1 and 100'
      });
    }

    const roadmap = await generateDecarbRoadmap(targetReductionPercent);
    res.json({
      status: 'success',
      data: roadmap
    });
  } catch (error) {
    next(error);
  }
};
