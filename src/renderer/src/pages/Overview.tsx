import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Overview = () => {
  const [summary, setSummary] = useState({ matched: 0, flagged: 0, unreconciled: 0 });
  const navigate = useNavigate();

  const api = (window as any).api;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await api.getReconSummary();
        // If stats is somehow null, don't set it to state
        if (stats) setSummary(stats);
      } catch (err) {
        console.error("Failed to fetch overview stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-slate-500 text-lg">
          Centralized monitoring for your delivery partner reconciliations.
        </p>
      </header>

      {/* BIG STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <OverviewCard
          label="Total Matched"
          value={summary.matched}
          trend="+12% from last week"
          color="bg-emerald-600"
        />
        <OverviewCard
          label="Flagged Issues"
          value={summary.flagged}
          trend="Requires attention"
          color="bg-amber-500"
        />
        <OverviewCard
          label="Pending"
          value={summary.unreconciled}
          trend="Awaiting matching"
          color="bg-slate-400"
        />
      </div>

      {/* NAVIGATION SHORTCUTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PartnerShortcut
          name="FoodPanda"
          icon="🐼"
          desc="Check commission gaps and voucher discrepancies."
          onClick={() => navigate("/recon/panda")}
        />
        <PartnerShortcut
          name="GrabFood"
          icon="🚗"
          desc="Verify booking IDs and delivery fee adjustments."
          onClick={() => navigate("/recon/grab")}
        />
      </div>
    </div>
  );
};

/* --- UI COMPONENTS --- */
const OverviewCard = ({ label, value, trend, color }: any) => {
  // 1. Logic for handling loading vs. zero vs. data
  const isLoading = value === undefined || value === null;
  const safeValue = typeof value === "number" ? value : 0;
  const isZero = safeValue === 0;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden group transition-all hover:shadow-md hover:border-slate-300">
      {/* Visual Accent */}
      <div className={`absolute top-0 left-0 w-2 h-full transition-all group-hover:w-3 ${color}`} />

      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">{label}</p>

      <div className="flex items-baseline gap-2 mb-4">
        {isLoading ? (
          /* 2. Loading Skeleton */
          <div className="h-12 w-24 bg-slate-100 animate-pulse rounded-lg" />
        ) : (
          <p
            className={`text-5xl font-black tracking-tighter ${isZero ? "text-slate-300" : "text-slate-900"}`}>
            {safeValue.toLocaleString()}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* 3. Conditional Trend Icon */}
        {!isZero && !isLoading && <span className="text-xs">📈</span>}
        <p className={`text-xs font-medium ${isZero ? "text-slate-300 italic" : "text-slate-500"}`}>
          {isZero ? "No data to report" : trend}
        </p>
      </div>
    </div>
  );
};

const PartnerShortcut = ({ name, icon, desc, onClick }: any) => (
  <button
    onClick={onClick}
    className="flex items-center gap-6 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all text-left group">
    <div className="text-5xl bg-slate-50 w-20 h-20 flex items-center justify-center rounded-2xl group-hover:bg-indigo-50 transition-colors">
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-bold text-slate-900">{name}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </button>
);

export default Overview;
