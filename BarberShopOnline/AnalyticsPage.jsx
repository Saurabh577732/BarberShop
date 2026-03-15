// src/pages/AnalyticsPage.jsx
import { useEffect, useState } from "react";
import { BarChart2, IndianRupee, TrendingUp, Scissors } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  Legend, LineChart, Line,
} from "recharts";
import api from "../utils/api";
import StatCard from "../components/ui/StatCard";

const PIE_COLORS  = ["#00e5ff","#a855f7","#f59e0b","#10b981","#f97316","#64748b"];
const CUSTOM_TIP  = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 border-white/15 text-xs space-y-1">
      <p className="text-slate-300 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.name === "Revenue" || p.name === "revenue" ? `₹${p.value?.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [range,    setRange]    = useState(30);
  const [chart,    setChart]    = useState([]);
  const [payments, setPayments] = useState([]);
  const [topSvcs,  setTopSvcs]  = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/dashboard/revenue-chart?days=${range}`),
      api.get("/dashboard/payment-breakdown"),
      api.get("/dashboard/top-services"),
      api.get("/dashboard/stats"),
    ]).then(([c, p, t, s]) => {
      setChart(c.data.data);
      setPayments(p.data.data.map((d) => ({ name: d._id, value: d.total, count: d.count })));
      setTopSvcs(t.data.data);
      setStats(s.data.stats);
    }).finally(() => setLoading(false));
  }, [range]);

  const totalRev   = chart.reduce((s, d) => s + d.revenue, 0);
  const totalSvcs  = chart.reduce((s, d) => s + d.count, 0);
  const avgPerDay  = chart.length ? Math.round(totalRev / chart.length) : 0;
  const peakDay    = chart.reduce((max, d) => d.revenue > max.revenue ? d : max, { revenue: 0, label: "—" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="text-slate-400 text-sm mt-0.5">Revenue insights and performance trends</p>
        </div>
        <div className="flex gap-1.5 p-1 bg-dark-700 rounded-xl border border-white/[0.06]">
          {[7, 14, 30, 90].map((d) => (
            <button key={d} onClick={() => setRange(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                range === d ? "bg-cyan/15 text-cyan border border-cyan/25" : "text-slate-400 hover:text-white"}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={IndianRupee} label={`Revenue (${range}d)`}  value={`₹${totalRev.toLocaleString()}`}  color="cyan"   sub={`Avg ₹${avgPerDay}/day`} />
            <StatCard icon={Scissors}   label={`Services (${range}d)`}  value={totalSvcs}                        color="violet" sub="Completed" />
            <StatCard icon={TrendingUp} label="Peak Day Revenue"         value={`₹${peakDay.revenue.toLocaleString()}`} color="green" sub={peakDay.label} />
            <StatCard icon={BarChart2}  label="Monthly Revenue"          value={`₹${(stats?.monthRevenue||0).toLocaleString()}`} color="amber" />
          </div>

          {/* Revenue area chart */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-5">Daily Revenue — Last {range} Days</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chart} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00e5ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill:"#64748b",fontSize:10 }} axisLine={false} tickLine={false}
                  interval={range > 14 ? "preserveStartEnd" : 0} />
                <YAxis tick={{ fill:"#64748b",fontSize:10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CUSTOM_TIP />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#00e5ff" strokeWidth={2.5} fill="url(#aGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart + Pie chart row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Services per day bar */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-5">Services Per Day</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chart} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill:"#64748b",fontSize:10 }} axisLine={false} tickLine={false}
                    interval={range > 14 ? "preserveStartEnd" : 0} />
                  <YAxis tick={{ fill:"#64748b",fontSize:10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CUSTOM_TIP />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="count" name="Services" fill="#a855f7" radius={[4,4,0,0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Payment breakdown pie */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-2">Payment Method Breakdown</h3>
              {payments.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-slate-500 text-sm">No payment data yet</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={payments} cx="50%" cy="50%" outerRadius={75} innerRadius={35} dataKey="value" strokeWidth={0} paddingAngle={3}>
                        {payments.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`,"Revenue"]}
                        contentStyle={{ background:"#0d1526",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,fontSize:12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2">
                    {payments.map((p, i) => (
                      <div key={p.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <div>
                          <p className="text-xs font-medium text-slate-300 capitalize">{p.name}</p>
                          <p className="text-xs text-slate-500">₹{p.value.toLocaleString()} · {p.count} txns</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Top services */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-5">Top Services by Revenue</h3>
            {topSvcs.length === 0 ? (
              <p className="text-center text-slate-500 py-8 text-sm">No service data yet</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topSvcs.map((s) => ({ name: s._id, revenue: s.revenue, count: s.count }))}
                    layout="vertical" margin={{ top: 0, right: 60, bottom: 0, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fill:"#64748b",fontSize:10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill:"#94a3b8",fontSize:11 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<CUSTOM_TIP />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="revenue" name="Revenue" fill="#00e5ff" radius={[0,6,6,0]} maxBarSize={22}
                      label={{ position:"right", fill:"#64748b", fontSize:11, formatter:(v)=>`₹${v}` }} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {topSvcs.map((s, i) => (
                    <div key={s._id} className="bg-dark-700 rounded-xl p-3 border border-white/[0.06]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500">#{i+1}</span>
                        <span className="text-xs font-medium text-slate-300 truncate">{s._id}</span>
                      </div>
                      <p className="text-cyan font-bold text-sm">₹{s.revenue.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">{s.count} bookings</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
