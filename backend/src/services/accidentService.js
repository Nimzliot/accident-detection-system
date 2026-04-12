import { accidentRepository } from "./accidentRepository.js";
import { triggerEmergencyAlerts } from "./alertService.js";
import { emitRealtimeUpdate } from "./socketService.js";
import { resolveAccidentLocation } from "../utils/location.js";
import { normalizeAccidentPayload } from "../utils/metrics.js";
import {
  buildSeveritySummary,
  calculateSeverity,
  normalizeSeverityInput
} from "../utils/severity.js";

export const createAccidentRecord = async (payload) => {
  const normalized = normalizeAccidentPayload(payload);
  const incomingLevel = normalizeSeverityInput(normalized.severity);
  const severity =
    incomingLevel > 0
      ? buildSeveritySummary(incomingLevel)
      : calculateSeverity(normalized);
  const location = resolveAccidentLocation({
    deviceId: normalized.deviceId,
    severityLevel: severity.level,
    latitude: normalized.latitude,
    longitude: normalized.longitude
  });

  const shouldTriggerEmergency = severity.level === 3;

  const device = await accidentRepository.upsertDevice({
    device_id: normalized.deviceId,
    status: shouldTriggerEmergency ? "alert" : "online",
    last_seen: normalized.timestamp,
    ...(Number.isFinite(location.latitude) && Number.isFinite(location.longitude)
      ? {
          latitude: location.latitude,
          longitude: location.longitude,
          location_updated_at: normalized.timestamp
        }
      : {})
  });

  const record = await accidentRepository.createAccident({
    device_id: normalized.deviceId,
    acceleration: normalized.acceleration,
    tilt_angle: normalized.tiltAngle,
    severity: severity.key,
    latitude: location.latitude,
    longitude: location.longitude,
    speed: normalized.speed,
    satellites: normalized.satellites,
    timestamp: normalized.timestamp,
    created_at: normalized.timestamp
  });

  let alertResult = null;
  if (shouldTriggerEmergency) {
    alertResult = await triggerEmergencyAlerts(record);
  }

  const summary = await accidentRepository.getSummary();

  emitRealtimeUpdate("accident:new", {
    accident: {
      ...record,
      severity_label: severity.label,
      severity_color: severity.color,
      priority: severity.priority,
      status: shouldTriggerEmergency ? "critical" : severity.level === 2 ? "responding" : "monitoring",
      location_simulated: location.simulated,
      speed: normalized.speed,
      satellites: normalized.satellites
    },
    alertResult,
    device,
    summary
  });

  return { record, alertResult, summary };
};

export const getAccidents = async (limit) => {
  const accidents = await accidentRepository.listAccidents(limit);
  return accidents.map((accident) => ({
    ...accident,
    ...buildSeveritySummary(accident.severity_level),
    status:
      accident.severity_level === 3
        ? "critical"
        : accident.severity_level === 2
          ? "responding"
          : "monitoring",
    location_simulated: true
  }));
};

export const getLatestAccident = async () => {
  const accident = await accidentRepository.getLatestAccident();
  return accident
    ? {
        ...accident,
        ...buildSeveritySummary(accident.severity_level),
        status:
          accident.severity_level === 3
            ? "critical"
            : accident.severity_level === 2
              ? "responding"
              : "monitoring",
        location_simulated: true
      }
    : null;
};

export const getDashboardSummary = () => accidentRepository.getSummary();
export const getDevices = () => accidentRepository.listDevices();
export const getAlerts = () => accidentRepository.listAlerts();

export const recordDeviceHeartbeat = async (payload) => {
  const normalized = normalizeAccidentPayload(payload);
  const device = await accidentRepository.upsertDevice({
    device_id: normalized.deviceId,
    status: "online",
    last_seen: normalized.timestamp
  });
  const summary = await accidentRepository.getSummary();

  emitRealtimeUpdate("deviceHeartbeat", {
    device,
    summary
  });

  return {
    device,
    summary
  };
};

export const recordDeviceLocation = async (payload) => {
  const normalized = normalizeAccidentPayload(payload);
  const device = await accidentRepository.upsertDevice({
    device_id: normalized.deviceId,
    status: "online",
    last_seen: normalized.timestamp,
    latitude: normalized.latitude,
    longitude: normalized.longitude,
    location_updated_at: normalized.timestamp
  });
  const summary = await accidentRepository.getSummary();

  emitRealtimeUpdate("device:location", {
    device,
    summary
  });

  return {
    device,
    summary
  };
};

export const acknowledgeAlert = async (payload) => {
  await accidentRepository.acknowledgeAlertsByAccident(payload.accidentId);

  const event = {
    accidentId: payload.accidentId,
    acknowledgedBy: payload.acknowledgedBy ?? "Control Room Operator",
    comment: payload.comment ?? "Alert acknowledged and escalated",
    acknowledgedAt: new Date().toISOString()
  };

  emitRealtimeUpdate("alert:acknowledged", event);
  return event;
};

export const processEmergencyAlert = async (payload) => {
  if (payload.action === "acknowledge") {
    return acknowledgeAlert(payload);
  }

  const accident = await accidentRepository.getAccidentById(payload.accidentId);
  const alertResult = await triggerEmergencyAlerts(accident);

  emitRealtimeUpdate("emergencyAlertTriggered", {
    accident,
    alertResult
  });

  return {
    accidentId: payload.accidentId,
    alertResult,
    triggeredAt: new Date().toISOString()
  };
};
