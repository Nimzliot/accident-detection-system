import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { getDevicePresence } from "../utils/deviceStatus";
import {
  acknowledgeEmergency,
  fetchDashboardData,
  simulateAccident
} from "../services/api";

const DashboardContext = createContext(null);
const socketUrl = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000";

const severityLabelToLevel = {
  MINOR: 1,
  MEDIUM: 2,
  SEVERE: 3
};

const enrichAccident = (accident) => {
  if (!accident) {
    return null;
  }

  const severityLabel =
    accident.severity_label ??
    (accident.severity === "SEVERE"
      ? "Severe"
      : accident.severity === "MEDIUM"
        ? "Medium"
        : "Minor");

  return {
    ...accident,
    severity_level:
      accident.severity_level ?? severityLabelToLevel[accident.severity ?? "MINOR"] ?? 1,
    severity_label: severityLabel,
    timestamp: accident.timestamp ?? accident.created_at,
    tilt_angle: accident.tilt_angle ?? 0,
    severity_color:
      accident.severity_color ??
      (severityLabel === "Severe"
        ? "red"
        : severityLabel === "Medium"
          ? "yellow"
          : "green")
  };
};

const normalizeDevice = (device) => ({
  id: device.id,
  deviceId: device.device_id ?? device.deviceId,
  status: device.status,
  lastSeen: device.last_seen ?? device.lastSeen,
  latitude:
    device.latitude === undefined || device.latitude === null ? null : Number(device.latitude),
  longitude:
    device.longitude === undefined || device.longitude === null ? null : Number(device.longitude),
  locationUpdatedAt: device.location_updated_at ?? device.locationUpdatedAt ?? null
});

const isSimulatedDevice = (deviceId = "") => deviceId.toUpperCase().startsWith("SIM-");

export const DashboardProvider = ({ children }) => {
  const { session } = useAuth();
  const [clock, setClock] = useState(Date.now());
  const [summary, setSummary] = useState({
    total: 0,
    minor: 0,
    medium: 0,
    severe: 0,
    activeDevices: 0,
    openAlerts: 0
  });
  const [devices, setDevices] = useState([]);
  const [accidents, setAccidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [latestAccident, setLatestAccident] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!session) {
      setAccidents([]);
      setAlerts([]);
      setDevices([]);
      setLatestAccident(null);
      setConnected(false);
      return undefined;
    }

    let mounted = true;
    setLoading(true);

    fetchDashboardData()
      .then((data) => {
        if (!mounted) {
          return;
        }

        setSummary(data.summary);
        setDevices(data.devices.map(normalizeDevice));
        setAccidents(data.accidents.map(enrichAccident));
        setAlerts(data.alerts);
        setLatestAccident(enrichAccident(data.latestAccident ?? data.accidents[0]));
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    const socket = io(socketUrl, {
      transports: ["websocket"]
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("deviceHeartbeat", ({ device, summary: nextSummary }) => {
      setSummary(nextSummary);
      setDevices((current) => {
        const normalizedDevice = normalizeDevice(device);
        const existing = current.filter((item) => item.deviceId !== normalizedDevice.deviceId);
        return [normalizedDevice, ...existing].sort((a, b) =>
          a.deviceId.localeCompare(b.deviceId)
        );
      });
    });
    socket.on("device:location", ({ device, summary: nextSummary }) => {
      setSummary(nextSummary);
      setDevices((current) => {
        const normalizedDevice = normalizeDevice(device);
        const existing = current.filter((item) => item.deviceId !== normalizedDevice.deviceId);
        return [normalizedDevice, ...existing].sort((a, b) =>
          a.deviceId.localeCompare(b.deviceId)
        );
      });
    });
    socket.on("accident:new", ({ accident, summary: nextSummary, device, alertResult }) => {
      const enrichedAccident = enrichAccident(accident);
      setSummary(nextSummary);
      setLatestAccident(enrichedAccident);
      setAccidents((current) => [enrichedAccident, ...current].slice(0, 50));
      setDevices((current) => {
        const normalizedDevice = normalizeDevice(device);
        const existing = current.filter((item) => item.deviceId !== normalizedDevice.deviceId);
        return [normalizedDevice, ...existing].sort((a, b) =>
          a.deviceId.localeCompare(b.deviceId)
        );
      });

      if (alertResult?.alert) {
        setAlerts((current) => [
          {
            ...alertResult.alert,
            accident: enrichedAccident
          },
          ...current
        ]);
      }
    });
    socket.on("alert:acknowledged", (event) => {
      setAlerts((current) =>
        current.map((item) =>
          item.accidentId === event.accidentId || item.accident_id === event.accidentId
            ? { ...item, sent: false, acknowledgedBy: event.acknowledgedBy }
            : item
        )
      );
    });

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, [session]);

  const acknowledgeAlert = async (accidentId) => {
    await acknowledgeEmergency({ accidentId, acknowledgedBy: session?.user?.email });
  };

  const runSimulation = async (type) => {
    const simulationPayloads = {
      minor: {
        device_id: "SIM-CAR-01",
        acceleration: 10.5,
        latitude: 12.9716,
        longitude: 77.5946,
        severity: "MINOR"
      },
      medium: {
        device_id: "SIM-CAR-01",
        acceleration: 14.8,
        latitude: 12.9724,
        longitude: 77.5951,
        severity: "MEDIUM"
      },
      severe: {
        device_id: "SIM-CAR-01",
        acceleration: 22.4,
        latitude: 12.9732,
        longitude: 77.5962,
        severity: "SEVERE"
      }
    };

    await simulateAccident({
      ...simulationPayloads[type],
      timestamp: new Date().toISOString()
    });
  };

  const value = useMemo(
    () => {
      const devicesWithPresence = devices.map((device) => ({
        ...device,
        presence: getDevicePresence(device.lastSeen)
      }));

      const hardwareDevices = devicesWithPresence.filter(
        (device) => !isSimulatedDevice(device.deviceId)
      );

      let hardwareStatus = {
        key: "not_detected",
        label: "No hardware detected",
        helper: "Connect an ESP32 device to begin live telemetry.",
        tone: "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30",
        dot: "bg-slate-400"
      };

      if (hardwareDevices.some((device) => device.presence.key === "online")) {
        hardwareStatus = {
          key: "connected",
          label: "Hardware connected",
          helper: "ESP32 heartbeat is active and live telemetry is available.",
          tone: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
          dot: "bg-emerald-400"
        };
      } else if (hardwareDevices.some((device) => device.presence.key === "stale")) {
        hardwareStatus = {
          key: "delayed",
          label: "Hardware delayed",
          helper: "A real device was seen recently, but heartbeat is delayed.",
          tone: "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30",
          dot: "bg-amber-300"
        };
      } else if (hardwareDevices.length > 0) {
        hardwareStatus = {
          key: "offline",
          label: "Hardware offline",
          helper: "Known device found, but no recent heartbeat is being received.",
          tone: "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/30",
          dot: "bg-rose-400"
        };
      }

      return {
        summary,
        devices: devicesWithPresence,
        hardwareDevices,
        hardwareStatus,
        accidents,
        alerts,
        latestAccident,
        connected,
        loading,
        acknowledgeAlert,
        runSimulation
      };
    },
    [summary, devices, accidents, alerts, latestAccident, connected, loading, session, clock]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }

  return context;
};
