import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Overview = () => {
  const [summary, setSummary] = useState({ matched: 0, flagged: 0, unreconciled: 0 });
  const navigate = useNavigate();

  const api = (window as any).api;


  useEffect(() => {
    const fetchStats = async () => {
      const stats = await api.getReconSummary();
      setSummary(stats);
    };
    fetchStats();
  }, []);

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-slate-500 text-lg">Centralized monitoring for your delivery partner reconciliations.</p>
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
          onClick={() => navigate('/recon/panda')}
        />
        <PartnerShortcut 
          name="GrabFood" 
          icon="🚗" 
          desc="Verify booking IDs and delivery fee adjustments."
          onClick={() => navigate('/recon/grab')}
        />
      </div>
    </div>
  );
};

/* --- UI COMPONENTS --- */

const OverviewCard = ({ label, value, trend, color }: any) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden group">
    <div className={`absolute top-0 left-0 w-2 h-full ${color}`} />
    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-2">{label}</p>
    <p className="text-5xl font-black text-slate-900 mb-4">{value.toLocaleString()}</p>
    <p className="text-sm font-medium text-slate-500">{trend}</p>
  </div>
);

const PartnerShortcut = ({ name, icon, desc, onClick }: any) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-6 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all text-left group"
  >
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