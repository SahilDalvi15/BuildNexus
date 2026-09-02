# Architecture Decision Records (ADRs)

This document tracks the core architectural decisions for BuildNexus V3.0.

## ADR-001: MERN Stack with Flask ML Proxy
**Date:** September 2026
**Status:** Accepted

### Context
BuildNexus requires a high-performance web dashboard (React), scalable document storage (MongoDB) for varying JSON structures (sensor telemetry), robust API handling (Express/Node), and advanced machine learning capabilities (scikit-learn/pandas).

### Decision
We chose the MERN (MongoDB, Express, React, Node.js) stack for the primary architecture. However, since Python is the industry standard for ML and data science, we decoupled the ML inference into a separate Flask API (`ml-services`).
- The Node.js backend serves as an orchestration layer, proxying requests to the Flask ML service.
- The Flask service is stateless and purely handles mathematical inference (predictive maintenance, anomaly detection, RUL calculations).

### Consequences
- **Positive:** Leverages the best tools for each job (Node for high-concurrency I/O, Python for heavy computation).
- **Negative:** Introduces network latency between the Node.js API and the Flask service. We mitigated this by returning immediate 202 Accepted responses for long-running batch predictions if needed, though most inferences are fast enough for synchronous proxying.

## ADR-002: Event-Driven Telemetry Ingestion
**Date:** September 2026
**Status:** Accepted

### Context
Factory IoT sensors transmit telemetry data at high frequencies. Directly writing each payload to the database using REST controllers creates severe bottlenecks and database locks.

### Decision
We implemented a lightweight event-driven ingestion pipeline within the Node.js monolithic architecture.
- Incoming HTTP requests from Edge Gateways are received by `/api/sensors/ingest`.
- The controller instantly validates the payload and emits a `TELEMETRY_RECEIVED` event to an internal `EventBus`.
- An independent `ingestionWorker.js` listens to this bus, aggregates the payloads in memory, and performs bulk database inserts every X seconds or Y messages.

### Consequences
- **Positive:** Massively increases ingestion throughput. The HTTP response is immediate (202 Accepted).
- **Negative:** Risk of data loss if the Node.js process crashes before the in-memory buffer is flushed to MongoDB. For mission-critical deployments, this would be swapped out for a robust message broker like Kafka or RabbitMQ.

## ADR-003: Hierarchical Multi-Tenant Data Model
**Date:** September 2026
**Status:** Accepted

### Context
BuildNexus must support enterprise clients managing multiple global factories, each with specific zones and production lines containing assets. A flat structure makes querying complex and inefficient.

### Decision
We adopted a strict parent-child schema hierarchy for the Digital Twin:
`Organization -> Plant -> PlantZone -> ProductionLine -> Machine`
- Data is normalized where appropriate (e.g., Users reference Plants, Machines reference ProductionLines).
- The `/api/digital-twin/layout` endpoint uses MongoDB aggregation pipelines to eagerly fetch and assemble the entire hierarchy in a single network request.

### Consequences
- **Positive:** Enables powerful spatial visualizations (2D digital twin views) and hierarchical access control.
- **Negative:** Complex aggregation pipelines can be slow if not properly indexed. We ensure indices are placed on `orgId`, `plantId`, `zoneId`, and `lineId`.
