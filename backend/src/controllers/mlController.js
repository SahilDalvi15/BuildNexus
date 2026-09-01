// We will use native fetch to call the Python ML Service
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';

// @desc    Predict machine failure risk and calculate RUL
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

    let data = await response.json();
    
    // Augment with Remaining Useful Life (RUL) estimation
    // If probability is high, RUL is low.
    if (data.probability) {
      const baseDays = 30; // Max expected life without issues
      const estimatedDays = Math.max(1, Math.round(baseDays * (1 - data.probability)));
      
      data.rulDays = {
        expected: estimatedDays,
        min: Math.max(1, estimatedDays - 2),
        max: estimatedDays + 3
      };
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze Root Cause for a specific prediction or alert
// @route   POST /api/ml/analyze-root-cause
// @access  Private
export const analyzeRootCause = async (req, res, next) => {
  try {
    const { machineData } = req.body;
    
    // In a real system, this would call an XAI (Explainable AI) model like SHAP.
    // For this release, we simulate the XAI output based on the input thresholds.
    const contributingFactors = [];
    
    if (machineData) {
      if (machineData.temperature && machineData.temperature > 85) {
        contributingFactors.push({ feature: 'temperature', importance: 0.65, value: machineData.temperature });
      }
      if (machineData.vibration && machineData.vibration > 4.0) {
        contributingFactors.push({ feature: 'vibration', importance: 0.25, value: machineData.vibration });
      }
      if (machineData.pressure && machineData.pressure > 120) {
        contributingFactors.push({ feature: 'pressure', importance: 0.10, value: machineData.pressure });
      }
    }

    // Default factors if none explicitly trigger
    if (contributingFactors.length === 0) {
        contributingFactors.push({ feature: 'operatingHours', importance: 0.5, value: machineData?.operatingHours || 0 });
        contributingFactors.push({ feature: 'maintenanceInterval', importance: 0.5, value: 'overdue' });
    }

    res.json({
      analysisId: `RCA-${Date.now()}`,
      timestamp: new Date(),
      primaryCause: contributingFactors[0].feature,
      contributingFactors: contributingFactors.sort((a, b) => b.importance - a.importance),
      recommendedActions: [
        { action: 'INSPECT', priority: 'HIGH', description: `Inspect ${contributingFactors[0].feature} sensor and related components.` }
      ]
    });
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
