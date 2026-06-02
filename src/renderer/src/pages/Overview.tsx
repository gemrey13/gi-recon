import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type OverviewTrendPoint = {
  day: string;
  total: number;
  matched: number;
  unmatched: number;
  match_rate: number;
};

type OverviewPartnerBreakdown = {
  partner_type: string;
  total: number;
  matched: number;
  match_rate: number;
};

type OverviewBranchRow = {
  branch_name: string;
  total: number;
  match_rate: number;
};

type OverviewStats = {
  total_transactions: number;
  matched: number;
  unreconciled: number;
  flagged: number;
  total_amount: number;
  overall_match_rate: number;
  total_variance: number;
  partner_breakdown: OverviewPartnerBreakdown[];
  daily_trend: OverviewTrendPoint[];
  top_branches: OverviewBranchRow[];
};

const Overview = () => {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const stats = await (window as any).api.overviewStats({ partnerType: "ALL" });
        setOverview(stats);
      } catch (err) {
        console.error("Failed to fetch overview stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Matched",
        value: overview?.matched,
        trend: `${overview?.overall_match_rate?.toFixed(1) ?? 0}% match rate`,
        color: "bg-emerald-600",
      },
      {
        label: "Flagged Issues",
        value: overview?.flagged,
        trend: "Review manual and unmatched items",
        color: "bg-amber-500",
      },
      {
        label: "Pending",
        value: overview?.unreconciled,
        trend: "Waiting for reconciliation",
        color: "bg-slate-400",
      },
      {
        label: "Total Sales",
        value: overview?.total_amount,
        trend: `${overview?.total_transactions?.toLocaleString() ?? 0} transactions`,
        color: "bg-indigo-600",
        currency: true,
      },
    ],
    [overview],
  );

  const chartMax = Math.max(1, ...(overview?.daily_trend.map((item) => item.total) ?? []));

  return (
    <div className="main-container">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-slate-500 text-lg max-w-2xl">
          Centralized monitoring for your delivery partner reconciliations, with quick access to
          partner dashboards, branch performance, and daily trend insights.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {summaryCards.map((card) => (
          <OverviewCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr] mb-12">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                    Match trend
                  </p>
                  <h2 className="text-xl font-bold text-slate-900">Last 14 days</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {overview?.daily_trend.length ?? 0} days
                </span>
              </div>

              <div className="space-y-4">
                {(overview?.daily_trend ?? []).length > 0 ? (
                  <div className="space-y-3">
                    {(overview?.daily_trend ?? []).map((point) => (
                      <div key={point.day} className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{point.day}</span>
                          <span>{point.total.toLocaleString()} tx</span>
                        </div>
                        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all"
                            style={{ width: `${(point.total / chartMax) * 100}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span>Matched {point.matched}</span>
                          <span>Unmatched {point.unmatched}</span>
                          <span>{point.match_rate.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-400">
                    No trend data available yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                  Partner split
                </p>
                <h2 className="text-xl font-bold text-slate-900">Partner breakdown</h2>
              </div>
              <div className="space-y-4">
                {(overview?.partner_breakdown ?? []).map((partner) => (
                  <div
                    key={partner.partner_type}
                    className="grid gap-3 sm:grid-cols-[1fr_auto] items-center">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{partner.partner_type}</p>
                      <p className="text-xs text-slate-500">
                        {partner.matched.toLocaleString()} matched of{" "}
                        {partner.total.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{partner.match_rate}%</p>
                      <p className="text-xs text-slate-400">match rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                Quick shortcuts
              </p>
              <h2 className="text-xl font-bold text-slate-900">Partner dashboards</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PartnerShortcut
                name="FoodPanda"
                icon="🐼"
                desc="Open the FoodPanda reconciliation workflow."
                onClick={() => navigate("/recon/panda")}
              />
              <PartnerShortcut
                name="GrabFood"
                icon="🚗"
                desc="Open the Grab reconciliation workflow."
                onClick={() => navigate("/recon/grab")}
              />
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                  Top branches
                </p>
                <h2 className="text-xl font-bold text-slate-900">Most active locations</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Top 5
              </span>
            </div>
            <div className="space-y-4">
              {(overview?.top_branches ?? []).length > 0 ? (
                (overview?.top_branches ?? []).map((branch) => (
                  <div
                    key={branch.branch_name}
                    className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{branch.branch_name}</p>
                        <p className="text-xs text-slate-500">
                          {branch.total.toLocaleString()} transactions
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-600 border border-slate-200">
                        {branch.match_rate}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-400">
                  No branch activity available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OverviewCard = ({ label, value, trend, color, loading, currency }: any) => {
  const isLoading = loading;
  const safeValue = typeof value === "number" ? value : 0;
  const isZero = safeValue === 0;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden group transition-all hover:shadow-md hover:border-slate-300">
      <div className={`absolute top-0 left-0 w-2 h-full transition-all group-hover:w-3 ${color}`} />
      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">{label}</p>
      <div className="flex items-baseline gap-2 mb-4">
        {isLoading ? (
          <div className="h-12 w-24 bg-slate-100 animate-pulse rounded-lg" />
        ) : (
          <p
            className={`text-2xl font-black tracking-tighter ${isZero ? "text-slate-300" : "text-slate-900"}`}>
            {currency ? `₱${safeValue.toLocaleString()}` : safeValue.toLocaleString()}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!isZero && !isLoading && <span className="text-xs">📈</span>}
        <p className={`text-xs font-medium ${isZero ? "text-slate-300 italic" : "text-slate-500"}`}>
          {isLoading ? "Loading..." : isZero ? "No data to report" : trend}
        </p>
      </div>
    </div>
  );
};

const PartnerShortcut = ({ name, icon, desc, onClick }: any) => (
  <button
    onClick={onClick}
    className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition-all hover:bg-indigo-50 hover:border-indigo-200">
    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-3xl shadow-sm">
      {icon}
    </div>
    <div>
      <h3 className="text-base font-semibold text-slate-900">{name}</h3>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  </button>
);

export default Overview;
