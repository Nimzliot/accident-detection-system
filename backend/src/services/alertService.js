import axios from "axios";
import { env } from "../config/env.js";
import { accidentRepository } from "./accidentRepository.js";

const buildGoogleMapsLink = (latitude, longitude) =>
  `https://maps.google.com/?q=${Number(latitude).toFixed(6)},${Number(longitude).toFixed(6)}`;

const normalizeFast2SmsNumber = (value) => String(value).replace(/\D/g, "");

async function sendSmsAlert(data) {
  try {
    const apiKey = env.fast2SmsApiKey;
    const alertPhones = env.alertPhones
      .map(normalizeFast2SmsNumber)
      .filter(Boolean);

    if (!apiKey || alertPhones.length === 0) {
      console.error("Fast2SMS alert skipped: missing API key or alert phone numbers");
      return false;
    }

    const latitude = Number(data.latitude).toFixed(6);
    const longitude = Number(data.longitude).toFixed(6);
    const message =
      `Severe accident detected for ${data.device_id}.\n` +
      `Acc=${Number(data.acceleration).toFixed(2)} m/s^2, ` +
      `Tilt=${Number(data.tilt_angle ?? 0).toFixed(1)} deg, ` +
      `Speed=${Number(data.speed ?? 0).toFixed(1)} km/h,\n` +
      `Lat=${latitude}, Lon=${longitude},\n` +
      `Map: ${buildGoogleMapsLink(latitude, longitude)}\n` +
      `Deploy Link: ${env.frontendUrl}`;

    const response = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
      params: {
        authorization: apiKey,
        message,
        language: "english",
        route: "q",
        numbers: alertPhones.join(",")
      }
    });

    const responseData = response.data ?? {};
    const isSuccess =
      response.status >= 200 &&
      response.status < 300 &&
      responseData.return !== false &&
      responseData.message !== "Invalid Authentication, Check your Authorisation Key";

    if (!isSuccess) {
      console.error("Fast2SMS alert rejected:", responseData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Fast2SMS alert failed:", error.response?.data ?? error.message);
    return false;
  }
}

export const triggerEmergencyAlerts = async (accident) => {
  const latitude = Number(accident.latitude).toFixed(6);
  const longitude = Number(accident.longitude).toFixed(6);
  const mapLink = buildGoogleMapsLink(latitude, longitude);
  const message =
    `Severe accident detected for ${accident.device_id}.\n` +
    `Acc=${Number(accident.acceleration).toFixed(2)} m/s^2, ` +
    `Tilt=${Number(accident.tilt_angle ?? 0).toFixed(1)} deg, ` +
    `Speed=${Number(accident.speed ?? 0).toFixed(1)} km/h,\n` +
    `Lat=${latitude}, Lon=${longitude},\n` +
    `Map: ${mapLink}\n` +
    `Deploy Link: ${env.frontendUrl}`;

  const smsSent = await sendSmsAlert(accident);

  const alert = await accidentRepository.createAlert({
    accident_id: accident.id,
    message,
    sent: smsSent
  });

  return {
    alert,
    recipients: env.alertPhones
      .map(normalizeFast2SmsNumber)
      .filter(Boolean),
    deliveries: [
      {
        provider: "fast2sms",
        status: smsSent ? "sent" : "failed"
      }
    ],
    message,
    mapLink,
    triggeredAt: new Date().toISOString()
  };
};
