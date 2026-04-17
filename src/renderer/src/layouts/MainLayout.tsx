import MenuBar from "@renderer/ui/components/MenuBar";
import { Activity, useState } from "react";
import toast from "react-hot-toast";
import { NavLink, Outlet } from "react-router-dom";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarRightCollapse } from "react-icons/tb";

const MainLayout = () => {
  const [showSidebar, setShowSidebar] = useState(true);

  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  return (
    <>
      <MenuBar />
      <div className="flex h-[calc(100vh-32px)] bg-slate-50 text-slate-900 overflow-hidden font-sans relative">
        <div className={`h-full transition-all duration-300 ease-in-out ${showSidebar ? "w-64" : "w-0"}`}>
          <Activity mode={showSidebar ? "visible" : "hidden"}>
            <SideBar />
          </Activity>
        </div>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-auto relative">
          <button
            onClick={toggleSidebar}
            className={`
              top-10 z-50 
              flex items-center justify-center
              w-8 h-8 p-1 m-2
              bg-white border border-slate-200 rounded-full shadow-sm
              hover:shadow-md hover:scale-110 active:scale-95
              transition-all duration-300 ease-in-out left-2
            `}>
            <div className="text-slate-500 hover:text-indigo-600 transition-colors">
              {showSidebar ? (
                <TbLayoutSidebarLeftCollapse size={20} />
              ) : (
                <TbLayoutSidebarRightCollapse size={20} />
              )}
            </div>
          </button>

          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

const SideBar = () => {
  const [status, setStatus] = useState<string>("Idle");
  const [loading, setLoading] = useState(false);

  const handlePOSImport = async () => {
    setLoading(true);
    setStatus("Importing POS Data...");

    try {
      const result = await window.api.importPOSZip();
      if (result.totalInserted === 0) {
        toast.error(`${result.message}`);
      } else {
        toast.success(`Inserted: ${result.message}`);
      }
      setStatus(`Data Imported ✅`);
    } catch (err: any) {
      setStatus(`Error ❌ ${err.message}`);
      toast.error(`Error ❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-64 h-full bg-slate-900 text-white flex flex-col p-4 shadow-xl">
      <h1 className="text-xl font-black mb-10 px-2 tracking-tight">
        Gi-Recon <span className="text-indigo-400">PRO</span>
      </h1>

      <nav className="space-y-2 flex-1">
        <NavItem to="/" label="Overview" icon="📊" />
        <div className="pt-4 pb-2 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Reconciliation
        </div>
        <NavItem to="/recon/panda" label="FoodPanda" icon="🐼" />
        <NavItem to="/recon/grab" label="GrabFood" icon="🚗" />
        <NavItem to="/recon/test" label="Testing" icon="🧪" />
      </nav>

      <div className="mt-auto mb-4">
        <div className="bg-slate-800 rounded-xl p-3 text-xs space-y-2">
          <p className="text-slate-400 font-semibold tracking-wide">Import POS Data</p>

          <p className="text-slate-300 truncate" title={status ?? "Not selected"}>
            Status: {status ?? "Not selected"}
          </p>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handlePOSImport}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 text-white rounded-lg py-1 text-xs font-semibold transition
                  ${
                    loading
                      ? "bg-indigo-400 animate-pulse cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-500"
                  }`}>
              {loading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Syncing POS
                </>
              ) : (
                "Sync POS"
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ to, label, icon }: any) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
        isActive
          ? "bg-indigo-600 text-white shadow-lg"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`
    }>
    <span>{icon}</span> {label}
  </NavLink>
);

export default MainLayout;
