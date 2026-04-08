import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const DashboardLayout = () => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.14),_transparent_22%),radial-gradient(circle_at_right,_rgba(239,68,68,0.12),_transparent_24%),linear-gradient(180deg,_#120c0d,_#0d0910)] font-body text-white">
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
