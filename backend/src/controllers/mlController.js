// We will use native fetch to call the Python ML Service
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';

// @desc    Predict machine failure risk
// @route   POST /api/ml/predict-failure
// @access  Private
export const predictFailure = async (req, res, next) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict/failure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      throw new Error(`ML Service returned ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// @desc    Predict energy anomaly
// @route   POST /api/ml/predict-anomaly
// @access  Private
export const predictAnomaly = async (req, res, next) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict/anomaly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      throw new Error(`ML Service returned ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// @desc    Predict quality score
// @route   POST /api/ml/predict-quality
// @access  Private
export const predictQuality = async (req, res, next) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict/quality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      throw new Error(`ML Service returned ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    next(error);
  }
};
