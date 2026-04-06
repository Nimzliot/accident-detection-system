import { env } from "../config/env.js";

const boundedOffset = (seed, multiplier) => (((seed % 11) - 5) * multiplier) / 1000;

export const resolveAccidentLocation = ({ deviceId, severityLevel, latitude, longitude }) => {
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return { latitude, longitude, simulated: false };
  }

  const seed = [...String(deviceId)].reduce((total, char) => total + char.charCodeAt(0), 0);
  const severitySpread = severityLevel * 0.004;

  return {
    latitude: Number((env.simulatedLatitude + boundedOffset(seed, 4) + severitySpread).toFixed(6)),
    longitude: Number((env.simulatedLongitude + boundedOffset(seed, 5) - severitySpread).toFixed(6)),
    simulated: true
  };
};
