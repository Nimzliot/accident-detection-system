# Smart Accident Detection System With Web Dashboard

This repository contains a final-year engineering IoT prototype for detecting vehicle accidents, tracking live device location, and monitoring events through a realtime web dashboard.

## Modules

- `frontend`: React + Vite dashboard with Supabase Auth, Socket.IO, Recharts, Three.js, and Leaflet
- `backend`: Node.js + Express API with Supabase storage and realtime updates
- `embedded`: ESP32 firmware for accident detection, GPS tracking, and buzzer alerts
- `docs`: architecture, API, hardware, and setup documentation

## Features

- Accident detection using MPU6050 acceleration data
- Severe accident alerting with buzzer and backend event logging
- Live GPS location tracking from the ESP32
- Realtime dashboard updates with Socket.IO
- OpenStreetMap + Leaflet monitoring view
- Supabase-based accident, device, and alert storage
- Admin login for dashboard access

## Detection Logic

Acceleration magnitude:

```text
A = sqrt(x^2 + y^2 + z^2)
```

The embedded firmware converts sensor data to `m/s^2` and triggers a severe accident event when acceleration is `>= 18 m/s^2`.

## Hardware Configuration

Update these values in `embedded/esp32_mpu6050_accident_detector.ino` before uploading:

- `WIFI_SSID`
- `WIFI_PASSWORD`
- `BACKEND_BASE_URL`
- `DEVICE_ID`

Use your laptop's local IP address for the backend URLs, not `localhost`.

## Quick Start

1. Run `backend/database/schema.sql` in the Supabase SQL editor.
2. Create a user in Supabase Auth.
3. Start the backend with `npm install` and `npm run dev`.
4. Start the frontend with `npm install` and `npm run dev`.
5. Log in to the dashboard and test with simulation or real ESP32 hardware.

See `docs/` for full setup and project details.
