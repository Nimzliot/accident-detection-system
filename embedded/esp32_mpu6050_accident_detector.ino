#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <MPU6050.h>
#include <TinyGPS++.h>

// WiFi and backend settings
// You MUST update these before flashing.
// For local testing use the laptop LAN IP, not localhost.
// For online deployment use your public backend URL, for example:
// https://your-backend-domain/api
const char* WIFI_SSID = "";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* BACKEND_BASE_URL = "http://192.168.1.100:5000/api";
const char* DEPLOY_LINK = "https://your-deploy-link.vercel.app"; // Update with your frontend deploy link
const double DEFAULT_LATITUDE = 12.650616;
const double DEFAULT_LONGITUDE = 78.604561;
const char* DEVICE_ID = "vehicle_01";
const int EMERGENCY_CONTACT_COUNT = 5;
const char* EMERGENCY_CONTACTS[EMERGENCY_CONTACT_COUNT] = {
  "+911234567890",
  "+911234567891",
  "+911234567892",
  "+911234567893",
  "+911234567894"
};

// Pin connections
const int SDA_PIN = 21;
const int SCL_PIN = 22;
const int GPS_RX_PIN = 16;   // GPS TX -> ESP32 RX
const int GPS_TX_PIN = 17;   // GPS RX -> ESP32 TX
const int GSM_RX_PIN = 26;   // SIM800L TX -> ESP32 RX
const int GSM_TX_PIN = 27;   // SIM800L RX -> ESP32 TX
const int BUZZER_PIN = 25;
const float GRAVITY_MS2 = 9.80665f;

// Accident threshold
const float MINOR_THRESHOLD = 6.0f;
const float MEDIUM_THRESHOLD = 10.0f;
const float SEVERE_THRESHOLD = 14.0f;
const float MINOR_TILT = 8.0f;
const float MEDIUM_TILT = 16.0f;
const float SEVERE_TILT = 26.0f;
const float MEDIUM_SPEED = 18.0f;
const float SEVERE_SPEED = 32.0f;
const unsigned long SEND_DELAY_MS = 5000;
const unsigned long HEARTBEAT_DELAY_MS = 15000;
const unsigned long LOCATION_DELAY_MS = 5000;
const unsigned long GPS_STALE_MS = 15000;
const int GSM_COMMAND_TIMEOUT_MS = 4000;
const int GSM_RETRY_ATTEMPTS = 5;
const unsigned long GSM_RETRY_DELAY_MS = 1200;
const unsigned long GSM_CALL_DURATION_MS = 5000;
const int HTTP_TIMEOUT_MS = 5000;
const int HTTP_RETRY_ATTEMPTS = 3;

MPU6050 mpu;
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);
HardwareSerial gsmSerial(1);

// Forward declaration helps Arduino IDE auto-generated prototypes
// recognize the custom return type before function parsing.
struct MotionReading;

unsigned long lastSentTime = 0;
unsigned long lastHeartbeatTime = 0;
unsigned long lastLocationTime = 0;
float baselineTiltAngle = 0.0f;
bool lastGpsStatus = false;

bool containsPlaceholder(const char* value) {
  if (value == nullptr || value[0] == '\0') {
    return true;
  }

  String normalized = String(value);
  normalized.toUpperCase();
  return normalized.indexOf("YOUR") >= 0 || normalized.indexOf("192.168.1.100") >= 0;
}

bool containsPlaceholderPhone(const char* value) {
  if (containsPlaceholder(value)) {
    return true;
  }

  String normalized = String(value);
  return normalized.indexOf("1234567890") >= 0;
}

bool validateRequiredConfig() {
  bool valid = true;

  if (containsPlaceholder(WIFI_SSID)) {
    Serial.println("CONFIG ERROR: WIFI_SSID must be updated before flashing");
    valid = false;
  }

  if (containsPlaceholder(WIFI_PASSWORD)) {
    Serial.println("CONFIG ERROR: WIFI_PASSWORD must be updated before flashing");
    valid = false;
  }

  if (containsPlaceholder(BACKEND_BASE_URL)) {
    Serial.println("CONFIG ERROR: BACKEND_BASE_URL must be updated before flashing");
    valid = false;
  }

  if (containsPlaceholder(DEPLOY_LINK)) {
    Serial.println("CONFIG ERROR: DEPLOY_LINK must be updated before flashing");
    valid = false;
  }

  for (int index = 0; index < EMERGENCY_CONTACT_COUNT; index++) {
    if (containsPlaceholderPhone(EMERGENCY_CONTACTS[index])) {
      Serial.print("CONFIG ERROR: EMERGENCY_CONTACTS[");
      Serial.print(index);
      Serial.println("] must be updated before flashing");
      valid = false;
    }
  }

  if (!valid) {
    Serial.println("Fix required config values and flash again.");
  }

  return valid;
}

String buildApiUrl(const char* path) {
  String url = String(BACKEND_BASE_URL);
  if (!url.endsWith("/")) {
    url += "/";
  }
  url += path;
  return url;
}

String buildGoogleMapsLink(double latitude, double longitude) {
  String url = "https://maps.google.com/?q=";
  url += String(latitude, 6);
  url += ",";
  url += String(longitude, 6);
  return url;
}

struct MotionReading {
  float acceleration;
  float tiltAngle;
};

float normalizeTiltDelta(float currentTilt, float baselineTilt) {
  float delta = fabs(currentTilt - baselineTilt);
  if (delta > 180.0f) {
    delta = 360.0f - delta;
  }
  return delta;
}

bool hasFreshGpsFix() {
  return gps.location.isValid() &&
    gps.location.age() < GPS_STALE_MS &&
    (!gps.satellites.isValid() || gps.satellites.value() >= 3);
}

bool shouldSend(unsigned long lastTime, unsigned long intervalMs) {
  return millis() - lastTime > intervalMs;
}

void feedGpsFor(unsigned long durationMs) {
  const unsigned long start = millis();
  while (millis() - start < durationMs) {
    while (gpsSerial.available()) {
      gps.encode(gpsSerial.read());
    }
    delay(2);
  }
}

void connectWiFi() {
  Serial.println("ESP32 booted");
  Serial.println("WiFi module starting...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    attempts++;
    if (attempts >= 40) {
      Serial.println("\nWiFi connection failed");
      Serial.println("Check WiFi name, password, router band, or signal strength");
      return;
    }
  }

  Serial.println("\nWiFi connected");
  Serial.println("ESP32 + WiFi started successfully");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("Backend base URL: ");
  Serial.println(BACKEND_BASE_URL);
}

void setupMPU6050() {
  Serial.println("MPU6050 setup starting...");
  Wire.begin(SDA_PIN, SCL_PIN);
  mpu.initialize();

  if (mpu.testConnection()) {
    Serial.println("MPU6050 connected");
    Serial.println("MPU6050 started successfully");
  } else {
    Serial.println("MPU6050 connection failed");
    Serial.println("Check MPU6050 wiring and power");
  }
}

void calibrateTiltBaseline() {
  const int sampleCount = 30;
  float totalTilt = 0.0f;

  Serial.println("Calibrating MPU6050 baseline tilt. Keep device steady...");
  for (int index = 0; index < sampleCount; index++) {
    MotionReading reading = readMotion();
    totalTilt += reading.tiltAngle;
    delay(50);
  }

  baselineTiltAngle = totalTilt / sampleCount;
  Serial.print("Baseline tilt angle: ");
  Serial.println(baselineTiltAngle, 2);
}

void setupGPS() {
  Serial.println("GPS setup starting...");
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  Serial.println("GPS started");
  Serial.println("If satellite count stays 0, check GPS wiring and move outdoors");
}

void setupGSM() {
  Serial.println("GSM setup starting...");
  gsmSerial.begin(9600, SERIAL_8N1, GSM_RX_PIN, GSM_TX_PIN);
  feedGpsFor(1000);
  Serial.println("SIM800L started");
  Serial.println("If GSM fails later, check SIM, signal, and external power supply");
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
  float impact = fabs(magnitude - GRAVITY_MS2);
  float tilt = atan2(sqrt((x * x) + (y * y)), z) * 180.0f / PI;

  MotionReading reading;
  reading.acceleration = impact;
  reading.tiltAngle = tilt;
  return reading;
}

const char* classifySeverity(float acceleration, float tiltAngle, float speedKmph) {
  const float tiltDelta = normalizeTiltDelta(tiltAngle, baselineTiltAngle);
  const bool hasMinorImpact = acceleration >= 2.0f;
  const bool hasModerateImpact = acceleration >= 5.0f;

  if (acceleration >= SEVERE_THRESHOLD ||
      speedKmph >= SEVERE_SPEED ||
      (tiltDelta >= SEVERE_TILT && acceleration >= MINOR_THRESHOLD)) {
    return "SEVERE";
  }

  if (acceleration >= MEDIUM_THRESHOLD ||
      speedKmph >= MEDIUM_SPEED ||
      (tiltDelta >= MEDIUM_TILT && hasModerateImpact)) {
    return "MEDIUM";
  }

  if (acceleration >= MINOR_THRESHOLD ||
      (tiltDelta >= MINOR_TILT && hasMinorImpact)) {
    return "MINOR";
  }

  return "NONE";
}

void beepBuzzer() {
  digitalWrite(BUZZER_PIN, HIGH);
  feedGpsFor(3000);
  digitalWrite(BUZZER_PIN, LOW);
}

void flushGsmSerial() {
  while (gsmSerial.available()) {
    Serial.write(gsmSerial.read());
  }
}

const char* getPrimaryEmergencyContact() {
  return EMERGENCY_CONTACTS[0];
}

bool sendGsmCommand(const String& command, const char* expected, int timeoutMs = GSM_COMMAND_TIMEOUT_MS) {
  while (gsmSerial.available()) {
    gsmSerial.read();
  }

  gsmSerial.println(command);
  const unsigned long start = millis();
  String response = "";

  while (millis() - start < (unsigned long) timeoutMs) {
    while (gsmSerial.available()) {
      char character = (char) gsmSerial.read();
      response += character;
      Serial.write(character);
      if (response.indexOf(expected) >= 0) {
        return true;
      }
      if (response.indexOf("ERROR") >= 0) {
        return false;
      }
    }
    feedGpsFor(10);
  }

  return response.indexOf(expected) >= 0;
}

String readGsmResponse(int timeoutMs = GSM_COMMAND_TIMEOUT_MS) {
  const unsigned long start = millis();
  String response = "";

  while (millis() - start < (unsigned long) timeoutMs) {
    while (gsmSerial.available()) {
      char character = (char) gsmSerial.read();
      response += character;
      Serial.write(character);
    }
    feedGpsFor(10);
  }

  return response;
}

bool isGsmReady() {
  if (!sendGsmCommand("AT", "OK")) {
    Serial.println("SIM800L not responding to AT");
    return false;
  }

  if (!sendGsmCommand("AT+CPIN?", "READY")) {
    Serial.println("SIM800L SIM card not ready");
    return false;
  }

  bool registered = false;
  for (int attempt = 1; attempt <= GSM_RETRY_ATTEMPTS; attempt++) {
    while (gsmSerial.available()) {
      gsmSerial.read();
    }
    gsmSerial.println("AT+CREG?");
    String registrationResponse = readGsmResponse();
    Serial.print("SIM800L registration attempt ");
    Serial.print(attempt);
    Serial.print(": ");
    Serial.println(registrationResponse);

    if (registrationResponse.indexOf(",1") >= 0 || registrationResponse.indexOf(",5") >= 0) {
      registered = true;
      break;
    }

    feedGpsFor(GSM_RETRY_DELAY_MS);
  }

  if (!registered) {
    Serial.println("SIM800L not registered on network");
    return false;
  }

  if (!sendGsmCommand("AT+CMGF=1", "OK")) {
    Serial.println("SIM800L could not enter SMS text mode");
    return false;
  }

  return true;
}

int postJsonWithRetry(const String& url, const String& payload) {
  int httpCode = -1;

  for (int attempt = 1; attempt <= HTTP_RETRY_ATTEMPTS; attempt++) {
    HTTPClient http;
    WiFiClientSecure secureClient;
    http.setTimeout(HTTP_TIMEOUT_MS);
    if (url.startsWith("https://")) {
      secureClient.setInsecure();
      http.begin(secureClient, url);
    } else {
      http.begin(url);
    }
    http.addHeader("Content-Type", "application/json");

    Serial.print("HTTP POST Attempt ");
    Serial.print(attempt);
    Serial.print(" -> ");
    Serial.println(url);
    Serial.println(payload);

    httpCode = http.POST(payload);
    String responseBody = http.getString();

    Serial.print("HTTP Response: ");
    Serial.println(httpCode);
    if (responseBody.length() > 0) {
      Serial.println(responseBody);
    }

    http.end();

    if (httpCode != -1) {
      return httpCode;
    }

    Serial.println("HTTP failed with -1, retrying...");
    feedGpsFor(300);
  }

  Serial.println("HTTP request failed after all retries");
  Serial.println("Check backend IP, backend server, same WiFi network, and firewall");
  return httpCode;
}

bool sendSmsToNumber(const char* phoneNumber, const String& sms) {
  gsmSerial.print("AT+CMGS=\"");
  gsmSerial.print(phoneNumber);
  gsmSerial.println("\"");

  String promptResponse = readGsmResponse();
  if (promptResponse.indexOf('>') < 0 || promptResponse.indexOf("ERROR") >= 0) {
    Serial.print("SIM800L did not provide SMS prompt for ");
    Serial.println(phoneNumber);
    Serial.println("GSM failure: SMS prompt not received");
    flushGsmSerial();
    return false;
  }

  gsmSerial.print(sms);
  feedGpsFor(500);
  gsmSerial.write(26);
  feedGpsFor(5000);

  Serial.print("SIM800L SMS -> ");
  Serial.println(phoneNumber);
  return true;
}

bool dialEmergencyCall(const char* phoneNumber) {
  Serial.print("SIM800L CALL -> ");
  Serial.println(phoneNumber);
  flushGsmSerial();
  feedGpsFor(500);
  gsmSerial.print("ATD");
  gsmSerial.print(phoneNumber);
  gsmSerial.println(";");

  String callResponse = readGsmResponse();
  if (callResponse.indexOf("OK") < 0 && callResponse.indexOf("CONNECT") < 0) {
    Serial.println("SIM800L failed to start emergency call");
    Serial.println("GSM failure: call command not accepted");
    flushGsmSerial();
    return false;
  }

  Serial.println("Emergency call ringing...");
  feedGpsFor(GSM_CALL_DURATION_MS);
  sendGsmCommand("ATH", "OK", 3000);
  Serial.println("Emergency call finished");
  feedGpsFor(3000);
  return true;
}

void sendSevereSmsAlert(float acceleration, float tiltAngle, float speedKmph, double latitude, double longitude) {
  String sms = "Severe accident detected for ";
  sms += DEVICE_ID;
  sms += ". Acc=";
  sms += String(acceleration, 2);
  sms += " m/s^2, Tilt=";
  sms += String(tiltAngle, 1);
  sms += " deg, Speed=";
  sms += String(speedKmph, 1);
  sms += " km/h";

  if (hasFreshGpsFix()) {
    sms += ", Lat=";
    sms += String(latitude, 6);
    sms += ", Lon=";
    sms += String(longitude, 6);
    sms += ", Map: ";
    sms += buildGoogleMapsLink(latitude, longitude);
  } else {
    sms += ", Default GPS Map: ";
    sms += buildGoogleMapsLink(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
  }
  sms += " Deploy Link: ";
  sms += DEPLOY_LINK;

  if (!isGsmReady()) {
    Serial.println("Skipping SMS because SIM800L is not ready");
    Serial.println("GSM failure: module/SIM/network not ready");
    return;
  }

  bool smsSent = false;
  for (int index = 0; index < EMERGENCY_CONTACT_COUNT; index++) {
    smsSent = sendSmsToNumber(EMERGENCY_CONTACTS[index], sms) || smsSent;
  }

  if (smsSent) {
    Serial.println("GSM SMS flow completed");
  } else {
    Serial.println("GSM failure: SMS could not be delivered to any configured contact");
  }

  for (int index = 0; index < EMERGENCY_CONTACT_COUNT; index++) {
    dialEmergencyCall(EMERGENCY_CONTACTS[index]);
  }

  Serial.println("GSM CALL flow completed");
  flushGsmSerial();
}

void sendAccident(float acceleration, float tiltAngle, float speedKmph, double latitude, double longitude, const char* severity) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected, cannot send data");
    return;
  }

  String accidentUrl = buildApiUrl("accident-data");

  String payload = "{";
  payload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"acceleration\":" + String(acceleration, 2) + ",";
  payload += "\"tilt_angle\":" + String(tiltAngle, 2) + ",";
  payload += "\"speed\":" + String(speedKmph, 2) + ",";
  if (hasFreshGpsFix()) {
    payload += "\"latitude\":" + String(latitude, 6) + ",";
    payload += "\"longitude\":" + String(longitude, 6) + ",";
  } else {
    payload += "\"latitude\":" + String(DEFAULT_LATITUDE, 6) + ",";
    payload += "\"longitude\":" + String(DEFAULT_LONGITUDE, 6) + ",";
  }
  payload += "\"severity\":\"" + String(severity) + "\"";
  payload += "}";

  Serial.print("Accident POST -> ");
  Serial.println(accidentUrl);
  postJsonWithRetry(accidentUrl, payload);
}

void sendLocation(double latitude, double longitude) {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  String locationUrl = buildApiUrl("device-location");

  String payload = "{";
  payload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"latitude\":" + String(latitude, 6) + ",";
  payload += "\"longitude\":" + String(longitude, 6);
  payload += "}";

  Serial.print("Location POST -> ");
  Serial.println(locationUrl);
  postJsonWithRetry(locationUrl, payload);
}

void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  String heartbeatUrl = buildApiUrl("device-heartbeat");

  String payload = "{";
  payload += "\"device_id\":\"" + String(DEVICE_ID) + "\"";
  payload += "}";

  Serial.print("Heartbeat POST -> ");
  Serial.println(heartbeatUrl);
  postJsonWithRetry(heartbeatUrl, payload);
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  Serial.println("Smart Accident Detection System booting...");

  if (!validateRequiredConfig()) {
    while (true) {
      delay(1000);
    }
  }

  connectWiFi();
  setupMPU6050();
  calibrateTiltBaseline();
  setupGPS();
  setupGSM();
  sendHeartbeat();
  lastHeartbeatTime = millis();
  Serial.println("All startup modules initialized");
}

void loop() {
  readGPS();

  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  MotionReading motion = readMotion();
  float acceleration = motion.acceleration;
  float tiltAngle = motion.tiltAngle;
  float tiltDelta = normalizeTiltDelta(tiltAngle, baselineTiltAngle);
  float speedKmph = gps.speed.isValid() ? gps.speed.kmph() : 0.0f;
  const char* severity = classifySeverity(acceleration, tiltAngle, speedKmph);
  const bool gpsValid = hasFreshGpsFix();

  if (gpsValid != lastGpsStatus) {
    if (gpsValid) {
      Serial.println("GPS STATUS: LOCKED");
    } else {
      Serial.println("GPS STATUS: SEARCHING");
    }
    lastGpsStatus = gpsValid;
  }

  double latitude = 0.0;
  double longitude = 0.0;
  if (gpsValid) {
    latitude = gps.location.lat();
    longitude = gps.location.lng();
  }

  Serial.print("Acceleration: ");
  Serial.print(acceleration);
  Serial.print(" m/s^2 | Tilt: ");
  Serial.print(tiltAngle);
  Serial.print(" deg | TiltDelta: ");
  Serial.print(tiltDelta);
  Serial.print(" deg | Speed: ");
  Serial.print(speedKmph);
  Serial.print(" km/h | Severity: ");
  Serial.print(severity);
  Serial.print(" | Sats: ");
  Serial.print(gps.satellites.isValid() ? gps.satellites.value() : 0);
  Serial.print(" | Lat: ");
  Serial.print(latitude, 6);
  Serial.print(" | Lon: ");
  Serial.println(longitude, 6);

  if (gpsValid && shouldSend(lastLocationTime, LOCATION_DELAY_MS)) {
    sendLocation(latitude, longitude);
    lastLocationTime = millis();
  }

  if (shouldSend(lastHeartbeatTime, HEARTBEAT_DELAY_MS)) {
    sendHeartbeat();
    lastHeartbeatTime = millis();
  }

  if (strcmp(severity, "NONE") != 0 && shouldSend(lastSentTime, SEND_DELAY_MS)) {
    Serial.print(severity);
    Serial.println(" accident detected");
    if (strcmp(severity, "SEVERE") == 0) {
      beepBuzzer();
      sendSevereSmsAlert(acceleration, tiltAngle, speedKmph, latitude, longitude);
    }
    if (!gpsValid) {
      Serial.println("GPS not locked, using default coordinates for accident reporting");
    }
    sendAccident(acceleration, tiltAngle, speedKmph, latitude, longitude, severity);
    lastSentTime = millis();
  }

  feedGpsFor(500);
}
