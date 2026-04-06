import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import MonitoringPage from "./pages/MonitoringPage";
import DeviceStatusPage from "./pages/DeviceStatusPage";
import ReportsPage from "./pages/ReportsPage";
import EmergencyAlertsPage from "./pages/EmergencyAlertsPage";

const App = () => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route
      path="/app"
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<DashboardPage />} />
      <Route path="monitoring" element={<MonitoringPage />} />
      <Route path="devices" element={<DeviceStatusPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="alerts" element={<EmergencyAlertsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
