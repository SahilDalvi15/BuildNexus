import eventBus from './eventBus.js';
import SensorReading from '../models/SensorReading.js';

// Simple in-memory queue to batch writes
let batchQueue = [];
const BATCH_SIZE = 50;
const BATCH_TIMEOUT_MS = 5000;
let timeoutId = null;

const flushBatch = async () => {
    if (batchQueue.length === 0) return;

    const currentBatch = [...batchQueue];
    batchQueue = [];

    try {
        await SensorReading.insertMany(currentBatch);
        // In a real app, we would acknowledge the event bus here
        // or handle retry logic for failed inserts.
        console.log(`[IngestionWorker] Flushed ${currentBatch.length} telemetry readings to DB.`);
    } catch (error) {
        console.error('[IngestionWorker] Error flushing batch:', error);
        // Basic retry mechanism: put them back in queue
        batchQueue.push(...currentBatch);
    }
};

const processTelemetry = (reading) => {
    batchQueue.push(reading);

    if (batchQueue.length >= BATCH_SIZE) {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        flushBatch();
    } else if (!timeoutId) {
        timeoutId = setTimeout(() => {
            timeoutId = null;
            flushBatch();
        }, BATCH_TIMEOUT_MS);
    }
};

// Listen to event bus
export const startIngestionWorker = () => {
    eventBus.on('telemetry:ingest', processTelemetry);
    console.log('[IngestionWorker] Started listening to telemetry:ingest events');
};
