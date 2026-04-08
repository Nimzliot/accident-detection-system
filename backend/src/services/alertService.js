import twilio from "twilio";
import { env } from "../config/env.js";
import { accidentRepository } from "./accidentRepository.js";

const hasTwilioConfig =
  env.twilioAccountSid && env.twilioAuthToken && env.twilioFromNumber;

const client = hasTwilioConfig
  ? twilio(env.twilioAccountSid, env.twilioAuthToken)
  : null;

const buildGoogleMapsLink = (latitude, longitude) =>
  `https://maps.google.com/?q=${Number(latitude).toFixed(6)},${Number(longitude).toFixed(6)}`;

const sendSms = async (to, body) => {
  if (!client) {
    return {
      provider: "simulation",
      to,
      status: "simulated",
      sid: `SIM-${Date.now()}`
    };
  }

  const response = await client.messages.create({
    to,
    from: env.twilioFromNumber,
    body
  });

  return {
    provider: "twilio",
    to,
    status: response.status,
    sid: response.sid
  };
};

export const triggerEmergencyAlerts = async (accident) => {
  const mapLink = buildGoogleMapsLink(accident.latitude, accident.longitude);
  const message =
    `Severe accident detected for ${accident.device_id}. ` +
    `Acceleration ${Number(accident.acceleration).toFixed(2)} m/s^2. ` +
    `Location ${Number(accident.latitude).toFixed(4)}, ${Number(accident.longitude).toFixed(4)}. ` +
    `Map ${mapLink}. Immediate response required. Dispatch emergency support.`;

  const recipients = [...env.emergencyContacts, env.ambulanceContact].filter(Boolean);
  const deliveries = [];

  for (const recipient of recipients) {
    deliveries.push(await sendSms(recipient, message));
  }

  const alert = await accidentRepository.createAlert({
    accident_id: accident.id,
    message,
    sent: true
  });

  return {
    alert,
    recipients,
    deliveries,
    message,
    mapLink,
    triggeredAt: new Date().toISOString()
  };
};
