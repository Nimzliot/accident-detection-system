import { getSupabaseAdmin } from "../config/supabase.js";
import { assertSupabase } from "../utils/http.js";

const formatAccident = (row) => ({
  id: row.id,
  device_id: row.device_id,
  acceleration: Number(row.acceleration),
  tilt_angle: Number(row.tilt_angle ?? 0),
  latitude: Number(row.latitude),
  longitude: Number(row.longitude),
  speed: Number(row.speed ?? 0),
  satellites: Number(row.satellites ?? 0),
  severity: row.severity,
  severity_level: row.severity_level ?? (row.severity === "SEVERE" ? 3 : row.severity === "MEDIUM" ? 2 : 1),
  timestamp: row.timestamp ?? row.created_at,
  created_at: row.created_at
});

export const accidentRepository = {
  async upsertDevice(device) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("devices")
      .upsert(device, { onConflict: "device_id" })
      .select()
      .single();

    assertSupabase(error, "Unable to update device status");
    return data;
  },

  async createAccident(accident) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("accidents")
      .insert(accident)
      .select()
      .single();

    assertSupabase(error, "Unable to store accident record");
    return formatAccident(data);
  },

  async createAlert(alert) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("alerts")
      .insert(alert)
      .select()
      .single();

    assertSupabase(error, "Unable to create alert");
    return data;
  },

  async listAccidents(limit = 50) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("accidents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    assertSupabase(error, "Unable to fetch accidents");
    return data.map(formatAccident);
  },

  async getLatestAccident() {
    const accidents = await this.listAccidents(1);
    return accidents[0] ?? null;
  },

  async getAccidentById(id) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("accidents")
      .select("*")
      .eq("id", id)
      .single();

    assertSupabase(error, "Unable to fetch accident record");
    return formatAccident(data);
  },

  async listDevices() {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("devices")
      .select("*")
      .order("last_seen", { ascending: false });

    assertSupabase(error, "Unable to fetch devices");
    return data.map((row) => ({
      id: row.id,
      deviceId: row.device_id,
      status: row.status,
      lastSeen: row.last_seen,
      latitude: row.latitude === null ? null : Number(row.latitude),
      longitude: row.longitude === null ? null : Number(row.longitude),
      locationUpdatedAt: row.location_updated_at
    }));
  },

  async listAlerts(limit = 20) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("alerts")
      .select("*, accidents(device_id, severity, acceleration, tilt_angle, latitude, longitude, speed, satellites, timestamp)")
      .order("created_at", { ascending: false })
      .limit(limit);

    assertSupabase(error, "Unable to fetch alerts");
    return data.map((row) => ({
      ...row,
      accidentId: row.accident_id
    }));
  },

  async acknowledgeAlertsByAccident(accidentId) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("alerts")
      .update({ sent: false })
      .eq("accident_id", accidentId);

    assertSupabase(error, "Unable to acknowledge alert");
  },

  async getSummary() {
    const [accidents, devices, alerts] = await Promise.all([
      this.listAccidents(200),
      this.listDevices(),
      this.listAlerts(50)
    ]);
    const activeThreshold = Date.now() - 1000 * 60;

    return {
      total: accidents.length,
      minor: accidents.filter((item) => item.severity === "MINOR").length,
      medium: accidents.filter((item) => item.severity === "MEDIUM").length,
      severe: accidents.filter((item) => item.severity === "SEVERE").length,
      activeDevices: devices.filter(
        (item) => new Date(item.lastSeen).getTime() >= activeThreshold
      ).length,
      openAlerts: alerts.filter((item) => item.sent).length
    };
  }
};
