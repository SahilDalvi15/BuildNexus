import TelemetryQueue from '../models/TelemetryQueue.js';
import SensorReading from '../models/SensorReading.js';

const BATCH_SIZE = 50;
const POLL_INTERVAL_MS = 2000;
let isProcessing = false;

const processQueue = async () => {
    if (isProcessing) return;
    isProcessing = true;

    try {
        // Find and lock pending jobs
        const pendingJobs = await TelemetryQueue.find({ status: 'PENDING' })
            .sort({ createdAt: 1 })
            .limit(BATCH_SIZE);

        if (pendingJobs.length > 0) {
            const jobIds = pendingJobs.map(job => job._id);
            
            // Mark as processing
            await TelemetryQueue.updateMany(
                { _id: { $in: jobIds } },
                { $set: { status: 'PROCESSING' }, $inc: { attempts: 1 } }
            );

            // Process payloads
            const readings = pendingJobs.map(job => job.payload);
            await SensorReading.insertMany(readings);

            // Delete successful jobs from queue
            await TelemetryQueue.deleteMany({ _id: { $in: jobIds } });

            console.log(`[IngestionWorker] Flushed ${readings.length} telemetry readings to DB from Mongo Queue.`);
        }
    } catch (error) {
        console.error('[IngestionWorker] Error processing queue:', error);
        // In a real app, we'd mark them as FAILED after max attempts, but here they stay PROCESSING and we'd need a dead-letter mechanism
    } finally {
        isProcessing = false;
        
        // Schedule next poll
        setTimeout(processQueue, POLL_INTERVAL_MS);
    }
};

export const startIngestionWorker = () => {
    console.log('[IngestionWorker] Started polling MongoDB TelemetryQueue');
    setTimeout(processQueue, POLL_INTERVAL_MS);
};
