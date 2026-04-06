import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

const mapCenter = [12.9716, 77.5946];

const markerColor = (level) => {
  if (level === 3) return "#ef4444";
  if (level === 2) return "#facc15";
  return "#22c55e";
};

const liveDevices = (devices) =>
  devices.filter((device) => Number.isFinite(device.latitude) && Number.isFinite(device.longitude));

const AccidentMap = ({ accidents, devices = [] }) => (
  <div className="rounded-[28px] border border-white/10 bg-panel/80 p-5 shadow-glow">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Incident Map</p>
        <h3 className="mt-2 font-display text-2xl text-white">OpenStreetMap live tracking</h3>
      </div>
      <div className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">
        {liveDevices(devices).length} live vehicle marker(s)
      </div>
    </div>

    <div className="h-[320px] overflow-hidden rounded-[24px] border border-white/10">
      <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {liveDevices(devices).map((device) => (
          <CircleMarker
            key={`device-${device.deviceId}`}
            center={[device.latitude, device.longitude]}
            pathOptions={{
              color: "#38bdf8",
              fillColor: "#38bdf8",
              fillOpacity: 0.85
            }}
            radius={8}
          >
            <Popup>
              <div className="space-y-1">
                <p><strong>{device.deviceId}</strong></p>
                <p>Live vehicle location</p>
                <p>Status: {device.status}</p>
                <p>Coordinates: {device.latitude.toFixed(4)}, {device.longitude.toFixed(4)}</p>
                <p>Updated: {new Date(device.locationUpdatedAt ?? device.lastSeen).toLocaleString()}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        {accidents.slice(0, 20).map((accident) => (
          <CircleMarker
            key={accident.id}
            center={[accident.latitude, accident.longitude]}
            pathOptions={{
              color: markerColor(accident.severity_level),
              fillColor: markerColor(accident.severity_level),
              fillOpacity: 0.75
            }}
            radius={10}
          >
            <Popup>
              <div className="space-y-1">
                <p><strong>{accident.device_id}</strong></p>
                <p>Severity: {accident.severity_label}</p>
                <p>Acceleration: {accident.acceleration} m/s^2</p>
                <p>Coordinates: {accident.latitude.toFixed(4)}, {accident.longitude.toFixed(4)}</p>
                <p>Time: {new Date(accident.timestamp ?? accident.created_at).toLocaleString()}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  </div>
);

export default AccidentMap;
