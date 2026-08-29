import SensorReading from '../models/SensorReading.js';

// @desc    Get latest readings for all machines
// @route   GET /api/sensors/latest
// @access  Public
export const getLatestReadings = async (req, res, next) => {
  try {
    // We can use an aggregation pipeline to get the latest reading per machine
    const latestReadings = await SensorReading.aggregate([
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: "$machineId",
          latestReading: { $first: "$$ROOT" }
        }
      }
    ]);

    // Format the response to return an array of the documents
    res.json(latestReadings.map(reading => reading.latestReading));
  } catch (error) {
    next(error);
  }
};

// @desc    Get sensor history for a machine
// @route   GET /api/sensors/:machineId
// @access  Public
export const getSensorHistory = async (req, res, next) => {
  try {
    const { machineId } = req.params;
    const limit = Number(req.query.limit) || 50;
    
    // Optional date filtering
    const query = { machineId };
    if (req.query.startDate && req.query.endDate) {
      query.timestamp = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const readings = await SensorReading.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json(readings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest reading for a specific machine
// @route   GET /api/sensors/:machineId/latest
// @access  Public
export const getLatestReadingForMachine = async (req, res, next) => {
  try {
    const { machineId } = req.params;
    const reading = await SensorReading.findOne({ machineId }).sort({ timestamp: -1 });

    if (reading) {
      res.json(reading);
    } else {
      res.status(404);
      throw new Error('No readings found for this machine');
    }
  } catch (error) {
    next(error);
  }
};
