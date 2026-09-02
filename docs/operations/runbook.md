# BuildNexus V3.0 Production Runbook

This document provides standardized incident response procedures for common failures in the BuildNexus production environment.

## 1. High-Frequency Telemetry Dropped (Ingestion Lag)

### Symptoms
- Frontend Dashboard shows delayed "Live Metrics" (stale timestamps).
- Gateway reports `429 Too Many Requests` or network timeouts.
- Node.js process CPU spikes to 100%.

### Root Cause
The `ingestionWorker.js` is failing to flush the internal event buffer to MongoDB fast enough, causing memory pressure and event loop blocking.

### Resolution Steps
1. **Scale Out Node API:** Telemetry ingestion is stateless before the buffer. Deploy additional Node.js instances behind the load balancer to distribute the HTTP POST load.
2. **Increase Batch Size:** Temporarily modify `ingestionWorker.js` configuration to flush every `1000` records instead of `100` to reduce MongoDB I/O overhead.
3. **Check MongoDB IOPS:** Ensure the MongoDB cluster has sufficient IOPS provisioning for write-heavy workloads.
4. **Transition to Kafka (Long Term):** If this occurs frequently, the in-memory Node `EventEmitter` must be replaced with a distributed message broker (Apache Kafka).

---

## 2. ML Inference Proxy Failure

### Symptoms
- 500 Internal Server Errors on the `/api/simulator/run` endpoint.
- "ML Model Unavailable" warnings on the Frontend UI.
- Node API logs show `ECONNREFUSED` targeting `localhost:5001`.

### Root Cause
The Flask Python `ml-services` container has crashed or is overwhelmed by concurrent inference requests from the Node API.

### Resolution Steps
1. **Restart Flask Service:** Attempt a rolling restart of the Python ML pods/containers.
2. **Check Model Memory Leaks:** Analyze Python memory usage. Large Pandas DataFrames or un-pickled Scikit-Learn objects may be causing OOM (Out of Memory) kills by the OS.
3. **Enable Circuit Breaker:** In the Node.js ML routing controller, ensure the circuit breaker is active. If Flask is down, Node should return cached/heuristic data or gracefully degrade the UI (e.g., hiding the RUL overlays) rather than crashing.

---

## 3. Digital Twin Layout Rendering Too Slow

### Symptoms
- Frontend `DigitalTwin.jsx` spins for > 5 seconds before loading.
- Database slow query logs indicate long execution times on `/api/digital-twin/layout`.

### Root Cause
The MongoDB aggregation pipeline joining `Plant` -> `PlantZone` -> `ProductionLine` -> `Machine` is performing full collection scans.

### Resolution Steps
1. **Verify Indices:** Run `db.machines.getIndexes()` and ensure `line` is indexed. Ensure `ProductionLine` has `zone` indexed.
2. **Enable Redis Caching:** Digital twin hierarchies change rarely (factories aren't physically reconfigured every day). Enable a 1-hour Redis cache on the layout endpoint, invalidating only when an Admin triggers a structural update.
