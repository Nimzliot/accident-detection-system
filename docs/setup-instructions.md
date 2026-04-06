# Setup Instructions

## 1. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Notes:

- Create a Supabase project first.
- Paste `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` into `backend/.env`.
- Optionally set `SIMULATED_LATITUDE` and `SIMULATED_LONGITUDE` for dashboard map defaults.
- Run `backend/database/schema.sql` inside the Supabase SQL editor.
- Add Twilio credentials in `.env` to send real SMS notifications.

## 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Then set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_BACKEND_URL`
- `VITE_SOCKET_URL`

## 3. Embedded Firmware

1. Open `embedded/esp32_mpu6050_accident_detector.ino` in Arduino IDE.
2. Install libraries:
   - `WiFi`
   - `HTTPClient`
   - `Wire`
   - `MPU6050`
   - `TinyGPSPlus`
3. Connect the hardware:
   - `MPU6050 SDA -> GPIO21`
   - `MPU6050 SCL -> GPIO22`
   - `GPS TX -> GPIO16`
   - `GPS RX -> GPIO17`
   - `Buzzer -> GPIO25`
4. Update `WIFI_SSID`, `WIFI_PASSWORD`, `BACKEND_BASE_URL`, and `DEVICE_ID` at the top of `embedded/esp32_mpu6050_accident_detector.ino`.
5. Select `ESP32 Dev Module` in Arduino IDE and upload.
6. Open Serial Monitor at `115200 baud`.
7. Keep the MPU6050 steady during startup so initialization completes cleanly.
8. Allow time for GPS lock. If GPS is not locked yet, the firmware continues running and the backend can still accept the accident event.

## 4. Demo Flow

1. Start the backend.
2. Start the React dashboard.
3. Power the ESP32 and connect it to WiFi.
4. Verify the device appears online in the dashboard within 10 to 15 seconds.
5. Wait for GPS lock and confirm latitude/longitude appear in accident payloads.
6. Simulate impact or tilt on the MPU6050.
7. Observe realtime dashboard updates, GPS coordinates, and buzzer behavior for severe accidents.
8. You can also use the dashboard simulation buttons for demo mode.
