import { generateRecommendations } from '../services/recommendationEngine.js';
import Recommendation from '../models/Recommendation.js';
import Verification from '../models/Verification.js';

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

export const updateRecommendationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const rec = await Recommendation.findById(id);
    if (!rec) return res.status(404).json({ message: 'Recommendation not found' });
    
    rec.status = status;
    
    if (status === 'APPROVED') {
      rec.approvedAt = new Date();
      rec.approverId = req.user?._id;
    }
    if (status === 'EXECUTED') {
      rec.executedAt = new Date();
    }
    
    await rec.save();
    
    res.json({ status: 'success', data: rec });
  } catch (error) { next(error); }
};
