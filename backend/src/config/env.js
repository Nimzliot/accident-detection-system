import dotenv from "dotenv";

dotenv.config();

const toBoolean = (value, fallback = false) => {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE ?? "",
  simulatedLatitude: Number(process.env.SIMULATED_LATITUDE ?? 12.9716),
  simulatedLongitude: Number(process.env.SIMULATED_LONGITUDE ?? 77.5946),
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? "",
  twilioFromNumber: process.env.TWILIO_FROM_NUMBER ?? "",
  emergencyContacts: (process.env.EMERGENCY_CONTACTS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
  ambulanceContact: process.env.AMBULANCE_CONTACT ?? "108"
};

export const isProduction = env.nodeEnv === "production";
