import SensorReading from '../models/SensorReading.js';
import TelemetryQueue from '../models/TelemetryQueue.js';

// @desc    Get latest readings for all machines
// @route   GET /api/sensors/latest
// @access  Public
export const getLatestReadings = async (req, res, next) => {
  try {
    const latestReadings = await SensorReading.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: "$machineId", latestReading: { $first: "$$ROOT" } } }
    ]);
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

// @desc    Ingest telemetry via MongoDB Queue
// @route   POST /api/sensors/ingest
// @access  Private (Edge Gateway)
export const ingestTelemetry = async (req, res, next) => {
  try {
    const payload = req.body;
    
    // Write instantly to the queue collection
    await TelemetryQueue.create({ payload });
    
    res.status(202).json({ message: 'Telemetry received and queued for processing in MongoDB' });
  } catch (error) {
    next(error);
  }
};

// @desc    Store-and-forward bulk upload from Edge Gateway
// @route   POST /api/sensors/bulk-ingest
// @access  Private (Edge Gateway)
export const bulkIngest = async (req, res, next) => {
  try {
    const { gatewayId, readings } = req.body;
    
    if (!readings || !Array.isArray(readings)) {
      return res.status(400).json({ message: 'Invalid payload: readings must be an array' });
    }

    // Process bulk readings into the Mongo queue
    const queueDocs = readings.map(reading => ({
      payload: { ...reading, gatewayId, isStoreAndForward: true }
    }));
    await TelemetryQueue.insertMany(queueDocs);

    res.status(202).json({ 
      message: 'Bulk telemetry received and queued in MongoDB',
      count: readings.length 
    });
  } catch (error) {
    next(error);
  }
};
