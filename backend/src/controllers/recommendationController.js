import { generateRecommendations } from '../services/recommendationEngine.js';

// @desc    Get AI-generated recommendations (PRD Section 35)
// @route   GET /api/recommendations
// @access  Private
export const getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await generateRecommendations();
    res.json({
      status: 'success',
      classification: 'All recommendations require human approval before execution.',
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) { next(error); }
};
