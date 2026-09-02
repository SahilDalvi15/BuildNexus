# Data Dictionary

This document outlines the core Mongoose schemas that power the BuildNexus platform.

## 1. Spatial & Organizational Models

### Plant
Represents a physical factory location.
- `plantId` (String, Unique): Identifier (e.g., P-BER-01)
- `name` (String): Display name
- `location` (String): Physical city/region

### PlantZone
A distinct physical area within a plant (e.g., Body Shop, Paint Shop).
- `plant` (ObjectId): Refers to `Plant`
- `zoneId` (String, Unique): Identifier
- `name` (String): Display name
- `spatialCoordinates` (Object): `{ x, y }` for rendering on the 2D Digital Twin

### ProductionLine
A logical grouping of machines working sequentially.
- `zone` (ObjectId): Refers to `PlantZone`
- `lineId` (String, Unique): Identifier
- `name` (String): Display name

### Machine (Asset)
A physical piece of equipment on the factory floor.
- `line` (ObjectId): Refers to `ProductionLine`
- `machineId` (String, Unique): Identifier
- `name` (String): Display name
- `type` (String): e.g., 'CNC', 'ROBOT_ARM'
- `currentStatus` (String): 'ONLINE', 'OFFLINE', 'WARNING', 'ERROR'
- `spatialCoordinates` (Object): `{ x, y }` relative to the Zone

## 2. Telemetry Model

### SensorData
Time-series data emitted by machines.
- `machine` (ObjectId): Refers to `Machine`
- `timestamp` (Date): When the reading occurred
- `metrics` (Object): Dynamic key-value pairs (e.g., `{ temperature: 75, vibration: 2.1 }`)
- `prediction` (Object): Results from the ML inference engine (e.g., `{ predicted_rul: 45, failure_probability: 0.1 }`)

## 3. Governance & Operations Models

### AuditLog
Records all administrative actions (especially ML model changes).
- `action` (String): What occurred (e.g., 'MODEL_UPDATE')
- `user` (ObjectId): Who performed it
- `details` (Object): Request payload and diff
- `ipAddress` (String): Origin IP

### MLModel
Registry of deployed machine learning models.
- `name` (String): e.g., 'vibration-anomaly-v2'
- `version` (String): Semantic versioning
- `type` (String): 'ANOMALY_DETECTION', 'PREDICTIVE_MAINTENANCE'
- `endpoint` (String): Flask API route to call
- `isActive` (Boolean): Determines which model the Node API routes traffic to
