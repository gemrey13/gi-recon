import { useEffect, useState } from 'react';

const ReconView = ({ partner }: { partner: 'GRAB' | 'PANDA' }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const api = (window as any).api;

  const loadData = async () => {
    setLoading(true);
    // Call the new IPC handle we created
    const result = await api.getPartnerData(partner);
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [partner]);

  return (
    <div className="flex flex-col h-full">
      {/* Header with Local "Run" Button */}
      <div className="p-8 pb-0 flex justify-between items-center">
        <h2 className="text-2xl font-bold">{partner === 'GRAB' ? 'GrabFood' : 'FoodPanda'} Reconciliation</h2>
        <button 
          onClick={async () => {
             setLoading(true);
             api.runReconciliation();
             await loadData();
          }}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700"
        >
          {loading ? 'Refreshing...' : 'Run Matcher'}
        </button>
      </div>

      <div className="p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 italic">POS Info</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-indigo-500 italic">Partner Info</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  {/* POS DATA COLUMN */}
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm">{row.pos_id || '---'}</div>
                    <div className="font-bold text-slate-900">₱{row.pos_amount?.toLocaleString() || '0'}</div>
                  </td>
                  
                  {/* PARTNER DATA COLUMN */}
                  <td className="px-6 py-4 bg-indigo-50/20">
                    <div className="font-mono text-xs text-slate-500">...{row.partner_id.slice(-6)}</div>
                    <div className="font-bold text-indigo-700">₱{row.partner_amount.toLocaleString()}</div>
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    <StatusBadge status={row.recon_status} />
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 font-bold text-xs uppercase hover:underline">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    MATCHED: "bg-emerald-100 text-emerald-700",
    FLAGGED: "bg-amber-100 text-amber-700",
    unreconciled: "bg-slate-100 text-slate-500"
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${styles[status]}`}>
      {status}
    </span>
  );
};

export default ReconView;