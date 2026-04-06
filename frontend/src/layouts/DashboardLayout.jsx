import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const DashboardLayout = () => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_22%),linear-gradient(180deg,_#08111f,_#040912)] font-body text-white">
    <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col lg:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 md:p-6 xl:p-8">
        <Topbar />
        <div className="mt-6">
          <Outlet />
        </div>
      </main>
    </div>
  </div>
);

export default DashboardLayout;
