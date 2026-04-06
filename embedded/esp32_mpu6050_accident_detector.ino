#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <MPU6050.h>
#include <TinyGPS++.h>

// WiFi and backend settings
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_URL = "http://SERVER_IP:5000/api/accident-data";
const char* LOCATION_URL = "http://SERVER_IP:5000/api/device-location";
const char* DEVICE_ID = "vehicle_01";

// Pin connections
const int SDA_PIN = 21;
const int SCL_PIN = 22;
const int GPS_RX_PIN = 16;   // GPS TX -> ESP32 RX
const int GPS_TX_PIN = 17;   // GPS RX -> ESP32 TX
const int BUZZER_PIN = 25;

// Accident threshold
const float ACCIDENT_THRESHOLD = 18.0f;   
const unsigned long SEND_DELAY_MS = 5000; 
const unsigned long LOCATION_DELAY_MS = 5000;

MPU6050 mpu;
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

unsigned long lastSentTime = 0;
unsigned long lastLocationTime = 0;

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

float readAccelerationMagnitude() {
  int16_t ax, ay, az;
  int16_t gx, gy, gz;

  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  float x = (ax / 16384.0f) * 9.80665f;
  float y = (ay / 16384.0f) * 9.80665f;
  float z = (az / 16384.0f) * 9.80665f;

  return sqrt((x * x) + (y * y) + (z * z));
}

void beepBuzzer() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(3000);
  digitalWrite(BUZZER_PIN, LOW);
}

void sendAccident(float acceleration, double latitude, double longitude) {
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
  payload += "\"latitude\":" + String(latitude, 6) + ",";
  payload += "\"longitude\":" + String(longitude, 6) + ",";
  payload += "\"severity\":\"SEVERE\"";
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

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  connectWiFi();
  setupMPU6050();
  setupGPS();
}

void loop() {
  readGPS();

  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  float acceleration = readAccelerationMagnitude();

  double latitude = 0.0;
  double longitude = 0.0;
  if (gps.location.isValid()) {
    latitude = gps.location.lat();
    longitude = gps.location.lng();
  }

  Serial.print("Acceleration: ");
  Serial.print(acceleration);
  Serial.print(" m/s^2 | Lat: ");
  Serial.print(latitude, 6);
  Serial.print(" | Lon: ");
  Serial.println(longitude, 6);

  if (gps.location.isValid() && millis() - lastLocationTime > LOCATION_DELAY_MS) {
    sendLocation(latitude, longitude);
    lastLocationTime = millis();
  }

  if (acceleration >= ACCIDENT_THRESHOLD && millis() - lastSentTime > SEND_DELAY_MS) {
    Serial.println("Severe accident detected");
    beepBuzzer();
    sendAccident(acceleration, latitude, longitude);
    lastSentTime = millis();
  }

  delay(500);
}
