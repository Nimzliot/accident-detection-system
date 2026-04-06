# API Documentation

## Base URL

`http://localhost:5000/api`

## `POST /accident-data`

Receives telemetry from the ESP32.

Sample request:

```json
{
  "device_id": "vehicle_01",
  "acceleration": 1.95,
  "tilt_angle": 48.5,
  "gyroscope_magnitude": 314.2,
  "severity": "SEVERE",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "speed": 42.3,
  "satellites": 7,
  "timestamp": "2026-04-01T18:30:00.000Z"
}
```

## `GET /accidents`

Returns the latest accident records. Supports `?limit=25`.

Each record includes:

- `device_id`
- `acceleration`
- `tilt_angle`
- `severity`
- `latitude`
- `longitude`
- `speed`
- `satellites`
- `timestamp`
- derived dashboard fields such as `severity_label`, `severity_color`, and `status`

## `GET /accidents/latest`

Returns the most recent accident event.

## `GET /dashboard-summary`

Returns:

- severity counts
- active device count
- open alert count
- latest device heartbeat list
- latest alert queue
- latest accident snapshot

## `POST /device-heartbeat`

Receives periodic ESP32 device heartbeats so the dashboard can show hardware online status even when no accident has happened.

Sample request:

```json
{
  "device_id": "vehicle_01",
  "timestamp": "2026-04-02T09:30:00.000Z"
}
```

## `POST /emergency-alert`

Acknowledges or escalates an emergency alert from the dashboard.

Sample request:

```json
{
  "accidentId": 3,
  "acknowledgedBy": "Dashboard Admin",
  "comment": "Ambulance dispatched"
}
```

## Socket.IO Events

- `accidentDetected`
- `deviceHeartbeat`
- `alert:acknowledged`
