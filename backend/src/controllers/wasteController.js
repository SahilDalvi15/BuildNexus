import WasteStream from '../models/WasteStream.js';
import { analyzeWasteOpportunities } from '../services/wasteEngine.js';

// @desc    Get all waste streams
// @route   GET /api/waste/streams
// @access  Private
export const getWasteStreams = async (req, res, next) => {
  try {
    const streams = await WasteStream.find().sort({ quantity: -1 });

    const totalWaste = streams.reduce((sum, s) => sum + s.quantity, 0);
    const recoverableWaste = streams.filter(s => s.recoverability === 'RECOVERABLE').reduce((sum, s) => sum + s.quantity, 0);
    const disposalWaste = streams.filter(s => s.recoverability === 'DISPOSAL').reduce((sum, s) => sum + s.quantity, 0);

    res.json({
      status: 'success',
      count: streams.length,
      summary: {
        totalWasteKg: totalWaste,
        recoverableKg: recoverableWaste,
        disposalKg: disposalWaste,
        recoveryRate: totalWaste > 0 ? ((recoverableWaste / totalWaste) * 100).toFixed(1) : 0
      },
      data: streams
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get waste-to-value recovery opportunities
// @route   GET /api/waste/opportunities
// @access  Private
export const getWasteOpportunities = async (req, res, next) => {
  try {
    const streams = await WasteStream.find({ recoverability: 'RECOVERABLE' });
    const opportunities = analyzeWasteOpportunities(streams);

    res.json({
      status: 'success',
      count: opportunities.length,
      data: opportunities
    });
  } catch (error) {
    next(error);
  }
};
