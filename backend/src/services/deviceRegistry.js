const deviceState = new Map([
  [
    "ESP32-CAR-001",
    {
      deviceId: "ESP32-CAR-001",
      status: "online",
      battery: 86,
      signalStrength: 78,
      lastHeartbeat: new Date(Date.now() - 1000 * 15).toISOString()
    }
  ],
  [
    "ESP32-CAR-004",
    {
      deviceId: "ESP32-CAR-004",
      status: "online",
      battery: 72,
      signalStrength: 69,
      lastHeartbeat: new Date(Date.now() - 1000 * 27).toISOString()
    }
  ],
  [
    "ESP32-CAR-007",
    {
      deviceId: "ESP32-CAR-007",
      status: "warning",
      battery: 44,
      signalStrength: 61,
      lastHeartbeat: new Date(Date.now() - 1000 * 43).toISOString()
    }
  ]
]);

export const updateDeviceHeartbeat = (deviceId, overrides = {}) => {
  const previous = deviceState.get(deviceId) ?? {
    deviceId,
    status: "online",
    battery: 100,
    signalStrength: 80
  };

  const next = {
    ...previous,
    ...overrides,
    lastHeartbeat: new Date().toISOString()
  };

  deviceState.set(deviceId, next);
  return next;
};

export const listDevices = () =>
  [...deviceState.values()].sort((a, b) =>
    a.deviceId.localeCompare(b.deviceId)
  );
