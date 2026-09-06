import client from 'prom-client';
import TelemetryQueue from '../models/TelemetryQueue.js';

// Initialize default Node.js metrics (CPU, RAM, Event Loop)
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom Metric: HTTP Response time
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5]
});
register.registerMetric(httpRequestDurationMicroseconds);

// Custom Metric: Telemetry Queue Size
const telemetryQueueSize = new client.Gauge({
  name: 'telemetry_queue_backlog_size',
  help: 'Number of pending telemetry payloads in MongoDB queue'
});
register.registerMetric(telemetryQueueSize);

// Middleware to track response times
export const trackMetrics = (req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route ? req.route.path : req.path, status_code: res.statusCode });
  });
  next();
};

// @desc    Get Prometheus Metrics
// @route   GET /api/metrics
// @access  Public (In production, this should be protected for internal DevOps IPs only)
export const getMetrics = async (req, res, next) => {
  try {
    // Update queue size gauge before responding
    const pendingCount = await TelemetryQueue.countDocuments({ status: 'PENDING' });
    telemetryQueueSize.set(pendingCount);

    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    next(error);
  }
};
