# BuildNexus API Reference

## Base URL
`http://{host}:5000/api`

## Authentication
All endpoints require a Bearer token in the `Authorization` header, obtained via the `/api/auth/login` endpoint.

---

## 1. Telemetry Ingestion API (Edge Gateway)

### `POST /sensors/ingest`
Receives high-frequency telemetry data from physical edge devices in the plant.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Payload:**
```json
{
  "machineId": "M-204",
  "temperature": 75.2,
  "vibration": 3.1,
  "power_consumption": 14.5,
  "operating_hours": 12450
}
```

**Response (202 Accepted):**
```json
{
  "status": "success",
  "message": "Telemetry received and queued for processing"
}
```
*Note: This endpoint emits an internal event (`TELEMETRY_RECEIVED`) which is processed asynchronously.*

---

## 2. Digital Twin Layout API

### `GET /digital-twin/layout/:plantId`
Fetches the complete spatial hierarchy (Plant -> Zones -> Lines -> Machines) for the 2D layout.

**Response (200 OK):**
```json
{
  "_id": "60d5ec...",
  "name": "Berlin Assembly Plant",
  "zones": [
    {
      "_id": "60d5ed...",
      "name": "Body Shop",
      "spatialCoordinates": { "x": 100, "y": 150 },
      "lines": [
        {
          "name": "Welding Line 1",
          "machines": [
            {
              "name": "Robot Arm Alpha",
              "currentStatus": "RUNNING",
              "spatialCoordinates": { "x": 120, "y": 160 }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 3. What-If Simulator API

### `POST /simulator/run`
Executes a stateless simulation against the Flask ML engine to predict the impact of changed operating parameters.

**Payload:**
```json
{
  "machineId": "60d5ef...",
  "modifications": {
    "temperature": 85.0,
    "vibration": 4.5,
    "productionRate": 1200
  }
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "impact": {
    "projectedRulDays": 14.5,
    "projectedFailureProbability": 0.82,
    "riskLevel": "CRITICAL"
  }
}
```
