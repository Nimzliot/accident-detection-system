import { Router } from "express";
import {
  fetchAccidents,
  fetchDashboardSummary,
  fetchLatestAccident,
  postAccidentData,
  postDeviceHeartbeat,
  postDeviceLocation,
  postEmergencyAlert
} from "../controllers/accidentController.js";
import { authenticateRequest } from "../middleware/authenticate.js";
import {
  accidentDataSchema,
  deviceLocationSchema,
  emergencyAlertSchema,
  heartbeatSchema,
  validateBody
} from "../middleware/validate.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    status: "ok",
    service: "smart-accident-system-backend",
    timestamp: new Date().toISOString()
  });
});

router.post("/accident-data", validateBody(accidentDataSchema), postAccidentData);
router.post("/device-heartbeat", validateBody(heartbeatSchema), postDeviceHeartbeat);
router.post("/device-location", validateBody(deviceLocationSchema), postDeviceLocation);
router.get("/dashboard-summary", authenticateRequest, fetchDashboardSummary);
router.get("/accidents", authenticateRequest, fetchAccidents);
router.get("/accidents/latest", authenticateRequest, fetchLatestAccident);
router.post(
  "/emergency-alert",
  authenticateRequest,
  validateBody(emergencyAlertSchema),
  postEmergencyAlert
);

export default router;
