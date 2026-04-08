import { z } from "zod";

const optionalCoordinate = (min, max) =>
  z.preprocess(
    (value) => (value === undefined || value === null || value === "" ? undefined : value),
    z.coerce.number().min(min).max(max).optional()
  );

export const accidentDataSchema = z.object({
  device_id: z.string().min(3).max(100),
  acceleration: z.coerce.number().min(0).max(100),
  latitude: optionalCoordinate(-90, 90),
  longitude: optionalCoordinate(-180, 180),
  tilt_angle: z.coerce.number().min(0).max(180).optional(),
  speed: z.coerce.number().min(0).max(300).optional(),
  severity: z.enum(["MINOR", "MEDIUM", "SEVERE"]),
  timestamp: z.string().optional()
});

export const heartbeatSchema = z.object({
  device_id: z.string().min(3).max(100),
  timestamp: z.string().optional()
});

export const deviceLocationSchema = z.object({
  device_id: z.string().min(3).max(100),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  timestamp: z.string().optional()
});

export const emergencyAlertSchema = z.object({
  accidentId: z.coerce.number().int().positive(),
  action: z.enum(["trigger", "acknowledge"]).optional(),
  acknowledgedBy: z.string().min(2).max(120).optional(),
  comment: z.string().min(2).max(250).optional()
});

export const validateBody = (schema) => (req, _res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
