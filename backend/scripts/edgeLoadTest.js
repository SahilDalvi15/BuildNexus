import axios from 'axios';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

const API_URL = 'http://localhost:5000/api/sensors/bulk-ingest';
const MACHINES = ['m1-cnc', 'm2-robot', 'm3-conveyor', 'm4-stamp', 'm5-welder'];

const generateRandomTelemetry = (machineId) => ({
    machineId,
    timestamp: new Date().toISOString(),
    readings: {
        temperature: 60 + Math.random() * 40,
        vibration: Math.random() * 5,
        pressure: 100 + Math.random() * 50
    },
    operatingStatus: 'RUNNING'
});

const runLoadTestWorker = async (workerId, durationSeconds, requestsPerSecond) => {
    console.log(`Worker ${workerId} started. Blasting ${requestsPerSecond} req/s for ${durationSeconds}s...`);
    const endTime = Date.now() + (durationSeconds * 1000);
    let successCount = 0;
    let failCount = 0;

    const intervalMs = 1000 / requestsPerSecond;

    const intervalId = setInterval(async () => {
        if (Date.now() > endTime) {
            clearInterval(intervalId);
            parentPort.postMessage({ workerId, successCount, failCount });
            return;
        }

        try {
            const readings = MACHINES.map(generateRandomTelemetry);
            await axios.post(API_URL, {
                gatewayId: `gw-load-test-${workerId}`,
                readings
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            successCount++;
        } catch (error) {
            failCount++;
            if (failCount % 10 === 0) {
                console.error(`Worker ${workerId} error sample: ${error.message}`);
            }
        }
    }, intervalMs);
};

if (isMainThread) {
    const NUM_WORKERS = 4;
    const DURATION = 30; // seconds
    const REQ_PER_SEC_PER_WORKER = 50; // Each request has 5 machine readings. 50 * 5 = 250 readings/s per worker. Total 1000 readings/s.

    console.log(`Starting IoT Edge Gateway Load Test...`);
    console.log(`Spawning ${NUM_WORKERS} workers.`);
    console.log(`Total target load: ${NUM_WORKERS * REQ_PER_SEC_PER_WORKER} HTTP req/s (${NUM_WORKERS * REQ_PER_SEC_PER_WORKER * MACHINES.length} telemetry readings/s) for ${DURATION}s.`);

    let completedWorkers = 0;
    let totalSuccess = 0;
    let totalFail = 0;

    for (let i = 0; i < NUM_WORKERS; i++) {
        const worker = new Worker(new URL(import.meta.url));
        worker.postMessage({ workerId: i, durationSeconds: DURATION, requestsPerSecond: REQ_PER_SEC_PER_WORKER });

        worker.on('message', (msg) => {
            console.log(`Worker ${msg.workerId} finished: ${msg.successCount} success, ${msg.failCount} failed.`);
            totalSuccess += msg.successCount;
            totalFail += msg.failCount;
            completedWorkers++;

            if (completedWorkers === NUM_WORKERS) {
                console.log('--- LOAD TEST COMPLETE ---');
                console.log(`Total Successful Requests: ${totalSuccess} (${totalSuccess * MACHINES.length} telemetry items)`);
                console.log(`Total Failed Requests: ${totalFail}`);
                process.exit(0);
            }
        });
    }
} else {
    parentPort.on('message', (msg) => {
        runLoadTestWorker(msg.workerId, msg.durationSeconds, msg.requestsPerSecond);
    });
}
