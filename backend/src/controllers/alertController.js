import SmartAlert from '../models/SmartAlert.js';

// @desc    Get smart alerts (PRD Section 34)
// @route   GET /api/alerts
// @access  Private
export const getAlerts = async (req, res, next) => {
  try {
    const alerts = await SmartAlert.find()
      .populate('machineId', 'name type')
      .sort({ priorityScore: -1 });
      
    res.json({
      status: 'success',
      count: alerts.length,
      data: alerts
    });
  } catch (error) { next(error); }
};

// @desc    Update alert status
// @route   PUT /api/alerts/:id/status
// @access  Private
export const updateAlertStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const alert = await SmartAlert.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    if (!alert) return res.status(404).json({ status: 'error', message: 'Alert not found' });
    res.json({ status: 'success', data: alert });
  } catch (error) { next(error); }
};
