import {
  createAccidentRecord,
  getAccidents,
  getAlerts,
  getDashboardSummary,
  getDevices,
  getLatestAccident,
  processEmergencyAlert,
  recordDeviceHeartbeat,
  recordDeviceLocation
} from "../services/accidentService.js";

export const postAccidentData = async (req, res, next) => {
  try {
    console.log("Incoming accident:", req.body);
    const result = await createAccidentRecord(req.body);
    res.status(201).json({
      success: true,
      message: "Accident record ingested successfully",
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const fetchAccidents = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 50);
    const accidents = await getAccidents(limit);
    res.json({ success: true, accidents });
  } catch (error) {
    next(error);
  }
};

export const fetchLatestAccident = async (_req, res, next) => {
  try {
    const accident = await getLatestAccident();
    res.json({ success: true, accident });
  } catch (error) {
    next(error);
  }
};

export const fetchDashboardSummary = async (_req, res, next) => {
  try {
    const [summary, devices, alerts, latestAccident] = await Promise.all([
      getDashboardSummary(),
      getDevices(),
      getAlerts(),
      getLatestAccident()
    ]);
    res.json({ success: true, summary, devices, alerts, latestAccident });
  } catch (error) {
    next(error);
  }
};

export const postEmergencyAlert = async (req, res, next) => {
  try {
    const result = await processEmergencyAlert(req.body);
    res.json({
      success: true,
      message:
        req.body.action === "acknowledge"
          ? "Emergency alert acknowledgement sent"
          : "Emergency alert workflow triggered",
      result
    });
  } catch (error) {
    next(error);
  }
};

export const postDeviceHeartbeat = async (req, res, next) => {
  try {
    const result = await recordDeviceHeartbeat(req.body);
    res.json({
      success: true,
      message: "Device heartbeat received",
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const postDeviceLocation = async (req, res, next) => {
  try {
    const result = await recordDeviceLocation(req.body);
    res.json({
      success: true,
      message: "Device location received",
      ...result
    });
  } catch (error) {
    next(error);
  }
};
