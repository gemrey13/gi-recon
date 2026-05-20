import ImportPOSModal from "@renderer/components/pos/modal/ImportPOSModal";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const SideBar = () => {
  const [showPOSModal, setShowPOSModal] = useState(false);

  return (
    <>
      {showPOSModal && <ImportPOSModal onCancel={() => setShowPOSModal(false)} />}

      <aside className="w-64 h-full bg-slate-900 text-white flex flex-col p-4 shadow-xl">
        <h1 className="text-xl font-black mb-10 px-2 tracking-tight">
          Gi-Recon <span className="text-indigo-400">v1.0</span>
        </h1>

        <nav className="space-y-2 flex-1">
          <NavItem to="/" label="Overview" icon="📊" />
          <div className="pt-4 pb-2 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Reconciliation
          </div>
          <NavItem to="/recon/panda" label="FoodPanda" icon="🐼" />
          <NavItem to="/recon/grab" label="GrabFood" icon="🚗" />
          <NavItem to="/recon/reports" label="Reports" icon="📋" />
          <NavItem to="/recon/settings" label="Settings" icon="⚙️" />
        </nav>

        <div className="mt-auto mb-4">
          <div className="bg-slate-800 rounded-xl p-3 text-xs space-y-2">
            <p className="text-slate-400 font-semibold tracking-wide">Import POS Data</p>
            <p className="text-slate-500 text-[10px] leading-relaxed">
              Sync your POS ZIP file into the local transaction ledger.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowPOSModal(true)}
                className="cursor-pointer w-full flex items-center justify-center gap-2 text-white rounded-lg py-1 text-xs font-semibold transition bg-indigo-600 hover:bg-indigo-500">
                Sync POS
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
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

export default SideBar;
