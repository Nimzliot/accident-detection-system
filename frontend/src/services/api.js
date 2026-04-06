import axios from "axios";
import { supabase } from "../lib/supabase";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000/api"
});

api.interceptors.request.use(async (config) => {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

const normalizeAlert = (alert) => ({
  id: alert.id,
  accidentId: alert.accident_id,
  message: alert.message,
  sent: alert.sent,
  created_at: alert.created_at,
  accident: alert.accidents
    ? {
        ...alert.accidents,
        severity_label:
          alert.accidents.severity === "SEVERE"
            ? "Severe"
            : alert.accidents.severity === "MEDIUM"
              ? "Medium"
              : "Minor",
        severity_level:
          alert.accidents.severity === "SEVERE"
            ? 3
            : alert.accidents.severity === "MEDIUM"
              ? 2
              : 1
      }
    : null
});

export const fetchDashboardData = async () => {
  const [{ data: summaryData }, { data: accidentsData }] = await Promise.all([
    api.get("/dashboard-summary"),
    api.get("/accidents?limit=25")
  ]);

  return {
    summary: summaryData.summary,
    devices: summaryData.devices,
    accidents: accidentsData.accidents,
    alerts: (summaryData.alerts ?? []).map(normalizeAlert),
    latestAccident: summaryData.latestAccident
  };
};

export const acknowledgeEmergency = (payload) =>
  api.post("/emergency-alert", {
    action: "acknowledge",
    ...payload
  });

export const simulateAccident = (payload) => api.post("/accident-data", payload);
