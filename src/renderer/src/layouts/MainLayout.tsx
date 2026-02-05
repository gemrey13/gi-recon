import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const MainLayout = () => {
  const [posPath, setPosPath] = useState<string | null>(null);

  useEffect(() => {
    (window as any).api.getPosPath().then(setPosPath);
  }, []);

  const changePosPath = async () => {
    try {
      const newPath = await (window as any).api.selectPosPath();
      if (newPath) {
        setPosPath(newPath);
      }
    } catch {
      alert("Invalid POS data folder selected");
    }
  };

  const openPosPath = () => {
    (window as any).api.openPosPath();
  };

  const handleReadPOSBranches = async () => {
    try {
      await (window as any).api.readPOSBranches();
 
    } catch (error) {
      console.error(error);
      alert("Failed to read POS branches");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-4 shadow-xl">
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
        </nav>

        <div className="mt-auto mb-4">
          <div className="bg-slate-800 rounded-xl p-3 text-xs space-y-2">
            <p className="text-slate-400 font-semibold tracking-wide">POS Data Folder</p>

            <p className="text-slate-300 truncate" title={posPath ?? "Not selected"}>
              {posPath ?? "Not selected"}
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={openPosPath}
                disabled={!posPath}
                className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded-lg py-1">
                Open
              </button>

              <button
                onClick={changePosPath}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg py-1 font-semibold">
                Change
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-800 rounded-xl text-xs">
          <p className="opacity-60">Last Sync</p>
          <p className="font-bold">Today, 10:45 AM</p>
             <button
            onClick={handleReadPOSBranches}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-1 text-xs font-semibold"
          >
            Sync POS Branches
          </button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 overflow-auto relative">
        <Outlet />
      </main>
    </div>
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
