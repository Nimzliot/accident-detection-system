export const safeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeTimestamp = (value) => {
  if (!value) {
    return new Date().toISOString();
  }

  const parsedDate = new Date(value);
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString();
  }

  const asNumber = Number(value);
  if (Number.isFinite(asNumber)) {
    return new Date().toISOString();
  }

  return new Date().toISOString();
};

export const normalizeAccidentPayload = (payload = {}) => ({
  deviceId: payload.device_id ?? "ESP32-UNKNOWN",
  latitude:
    payload.latitude === undefined ? undefined : safeNumber(payload.latitude, undefined),
  longitude:
    payload.longitude === undefined ? undefined : safeNumber(payload.longitude, undefined),
  acceleration: safeNumber(payload.acceleration),
  tiltAngle: safeNumber(payload.tilt_angle, 0),
  gyroscopeMagnitude: 0,
  speed: safeNumber(payload.speed, 0),
  satellites: Math.max(0, Math.round(safeNumber(payload.satellites, 0))),
  status: payload.status ?? "online",
  timestamp: normalizeTimestamp(payload.timestamp),
  severity: payload.severity ?? 0,
  notes: payload.notes ?? ""
});
