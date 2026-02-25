import { useState } from "react";
import toast from "react-hot-toast";
import { NavLink, Outlet } from "react-router-dom";

const MainLayout = () => {
  const [status, setStatus] = useState<string>('Idle')
  const [loading, setLoading] = useState(false)

  const handlePOSImport = async () => {
    setLoading(true)
    setStatus('Importing POS ZIP...')

    try {
      const result = await window.api.importPOSZip()
      setStatus(`Done ✅`)
      toast(`Done ✅ Inserted: ${result.totalInserted} | ${result.message}`)
    } catch (err: any) {
      setStatus(`Error ❌ ${err.message}`)
      toast(`Error ❌ ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

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
            <p className="text-slate-400 font-semibold tracking-wide">Import POS Data</p>

            <p className="text-slate-300 truncate" title={status ?? "Not selected"}>
              Status: {status ?? "Not selected"}
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handlePOSImport}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-1 text-xs font-semibold">
                Sync POS
              </button>
            </div> 
          </div>
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
