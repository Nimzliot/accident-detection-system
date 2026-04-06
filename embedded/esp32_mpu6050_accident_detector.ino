#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <MPU6050.h>
#include <TinyGPS++.h>

// WiFi and backend settings
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_URL = "http://SERVER_IP:5000/api/accident-data";
const char* HEARTBEAT_URL = "http://SERVER_IP:5000/api/device-heartbeat";
const char* LOCATION_URL = "http://SERVER_IP:5000/api/device-location";
const char* DEVICE_ID = "vehicle_01";

// Pin connections
const int SDA_PIN = 21;
const int SCL_PIN = 22;
const int GPS_RX_PIN = 16;   // GPS TX -> ESP32 RX
const int GPS_TX_PIN = 17;   // GPS RX -> ESP32 TX
const int BUZZER_PIN = 25;

// Accident threshold
const float MINOR_THRESHOLD = 8.0f;
const float MEDIUM_THRESHOLD = 12.0f;
const float SEVERE_THRESHOLD = 18.0f;
const float MINOR_TILT = 12.0f;
const float MEDIUM_TILT = 25.0f;
const float SEVERE_TILT = 40.0f;
const float MEDIUM_SPEED = 30.0f;
const float SEVERE_SPEED = 60.0f;
const unsigned long SEND_DELAY_MS = 5000;
const unsigned long HEARTBEAT_DELAY_MS = 15000;
const unsigned long LOCATION_DELAY_MS = 5000;

MPU6050 mpu;
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

unsigned long lastSentTime = 0;
unsigned long lastHeartbeatTime = 0;
unsigned long lastLocationTime = 0;

struct MotionReading {
  float acceleration;
  float tiltAngle;
};

void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");
  Serial.println(WiFi.localIP());
}

void setupMPU6050() {
  Wire.begin(SDA_PIN, SCL_PIN);
  mpu.initialize();

  if (mpu.testConnection()) {
    Serial.println("MPU6050 connected");
  } else {
    Serial.println("MPU6050 connection failed");
  }
}

void setupGPS() {
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  Serial.println("GPS started");
}

void readGPS() {
  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }
}

MotionReading readMotion() {
  int16_t ax, ay, az;
  int16_t gx, gy, gz;

  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  float x = (ax / 16384.0f) * 9.80665f;
  float y = (ay / 16384.0f) * 9.80665f;
  float z = (az / 16384.0f) * 9.80665f;
  float magnitude = sqrt((x * x) + (y * y) + (z * z));
  float tilt = atan2(sqrt((x * x) + (y * y)), z) * 180.0f / PI;

  MotionReading reading;
  reading.acceleration = magnitude;
  reading.tiltAngle = tilt;
  return reading;
}

const char* classifySeverity(float acceleration, float tiltAngle, float speedKmph) {
  if (acceleration >= SEVERE_THRESHOLD || tiltAngle >= SEVERE_TILT || speedKmph >= SEVERE_SPEED) {
    return "SEVERE";
  }

  if (acceleration >= MEDIUM_THRESHOLD || tiltAngle >= MEDIUM_TILT || speedKmph >= MEDIUM_SPEED) {
    return "MEDIUM";
  }

  if (acceleration >= MINOR_THRESHOLD || tiltAngle >= MINOR_TILT) {
    return "MINOR";
  }

  return "NONE";
}

void beepBuzzer() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(3000);
  digitalWrite(BUZZER_PIN, LOW);
}

void sendAccident(float acceleration, float tiltAngle, float speedKmph, double latitude, double longitude, const char* severity) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected, cannot send data");
    return;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  String payload = "{";
  payload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"acceleration\":" + String(acceleration, 2) + ",";
  payload += "\"tilt_angle\":" + String(tiltAngle, 2) + ",";
  payload += "\"speed\":" + String(speedKmph, 2) + ",";
  payload += "\"latitude\":" + String(latitude, 6) + ",";
  payload += "\"longitude\":" + String(longitude, 6) + ",";
  payload += "\"severity\":\"" + String(severity) + "\"";
  payload += "}";

  int httpCode = http.POST(payload);
  Serial.print("HTTP Response: ");
  Serial.println(httpCode);
  http.end();
}

void sendLocation(double latitude, double longitude) {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  HTTPClient http;
  http.begin(LOCATION_URL);
  http.addHeader("Content-Type", "application/json");

  String payload = "{";
  payload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"latitude\":" + String(latitude, 6) + ",";
  payload += "\"longitude\":" + String(longitude, 6);
  payload += "}";

  int httpCode = http.POST(payload);
  Serial.print("Location HTTP Response: ");
  Serial.println(httpCode);
  http.end();
}

void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  HTTPClient http;
  http.begin(HEARTBEAT_URL);
  http.addHeader("Content-Type", "application/json");

  String payload = "{";
  payload += "\"device_id\":\"" + String(DEVICE_ID) + "\"";
  payload += "}";

  int httpCode = http.POST(payload);
  Serial.print("Heartbeat HTTP Response: ");
  Serial.println(httpCode);
  http.end();
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  connectWiFi();
  setupMPU6050();
  setupGPS();
  sendHeartbeat();
  lastHeartbeatTime = millis();
}

void loop() {
  readGPS();

  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  MotionReading motion = readMotion();
  float acceleration = motion.acceleration;
  float tiltAngle = motion.tiltAngle;
  float speedKmph = gps.speed.isValid() ? gps.speed.kmph() : 0.0f;
  const char* severity = classifySeverity(acceleration, tiltAngle, speedKmph);

  double latitude = 0.0;
  double longitude = 0.0;
  if (gps.location.isValid()) {
    latitude = gps.location.lat();
    longitude = gps.location.lng();
  }

  Serial.print("Acceleration: ");
  Serial.print(acceleration);
  Serial.print(" m/s^2 | Tilt: ");
  Serial.print(tiltAngle);
  Serial.print(" deg | Speed: ");
  Serial.print(speedKmph);
  Serial.print(" km/h | Severity: ");
  Serial.print(severity);
  Serial.print(" | Lat: ");
  Serial.print(latitude, 6);
  Serial.print(" | Lon: ");
  Serial.println(longitude, 6);

  if (gps.location.isValid() && millis() - lastLocationTime > LOCATION_DELAY_MS) {
    sendLocation(latitude, longitude);
    lastLocationTime = millis();
  }

  if (millis() - lastHeartbeatTime > HEARTBEAT_DELAY_MS) {
    sendHeartbeat();
    lastHeartbeatTime = millis();
  }

  if (strcmp(severity, "NONE") != 0 && millis() - lastSentTime > SEND_DELAY_MS) {
    Serial.print(severity);
    Serial.println(" accident detected");
    if (strcmp(severity, "SEVERE") == 0) {
      beepBuzzer();
    }
    sendAccident(acceleration, tiltAngle, speedKmph, latitude, longitude, severity);
    lastSentTime = millis();
  }

  delay(500);
}
