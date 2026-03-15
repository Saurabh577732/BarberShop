// src/pages/DashboardHome.jsx
import { useEffect, useState } from "react";
import {
  IndianRupee, CalendarCheck, Users, Clock,
  TrendingUp, Scissors, Copy, ExternalLink,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/ui/StatCard";
import { format } from "date-fns";
import toast from "react-hot-toast";

const PIE_COLORS = { cash: "#00e5ff", upi: "#a855f7", card: "#f59e0b", other: "#64748b" };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 border-white/15 text-xs">
      <p className="text-slate-300 mb-1">{label}</p>
      <p className="text-cyan font-bold">₹{payload[0]?.value?.toLocaleString()}</p>
      <p className="text-slate-400">{payload[1]?.value} services</p>
    </div>
  );
};

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats,    setStats]    = useState(null);
  const [chart,    setChart]    = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/stats"),
      api.get("/dashboard/revenue-chart?days=14"),
      api.get("/dashboard/payment-breakdown"),
    ]).then(([s, c, p]) => {
      setStats(s.data.stats);
      setChart(c.data.data);
      setPayments(p.data.data.map((d) => ({ name: d._id, value: d.total, count: d.count })));
    }).finally(() => setLoading(false));
  }, []);

  const bookingLink = `${window.location.origin}/book/${user?.id}`;
  const copyLink = () => { navigator.clipboard.writeText(bookingLink); toast.success("Booking link copied!"); };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-cyan/30 border-t-cyan animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Overview 👋</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {format(new Date(), "EEEE, dd MMMM yyyy")} · {user?.shopName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:block truncate max-w-[180px]">{bookingLink}</span>
          <button onClick={copyLink} className="btn-ghost text-xs gap-1.5"><Copy size={13} /> Copy Link</button>
          <a href={bookingLink} target="_blank" rel="noreferrer" className="btn-ghost text-xs gap-1.5">
            <ExternalLink size={13} /> Preview
          </a>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={IndianRupee} label="Today's Revenue"  value={`₹${(stats?.todayRevenue || 0).toLocaleString()}`}  color="cyan"   sub={`${stats?.todayServices || 0} services`} />
        <StatCard icon={IndianRupee} label="This Week"        value={`₹${(stats?.weekRevenue  || 0).toLocaleString()}`}  color="violet" />
        <StatCard icon={CalendarCheck} label="Bookings Today" value={stats?.todayBookings || 0}                           color="green"  sub={`${stats?.pendingBookings || 0} pending`} />
        <StatCard icon={Users}         label="Total Customers" value={(stats?.totalCustomers || 0).toLocaleString()}      color="amber" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue area chart */}
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Revenue — Last 14 Days</h3>
            <span className="text-xs text-cyan font-semibold">₹{chart.reduce((s,d)=>s+d.revenue,0).toLocaleString()} total</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chart} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00e5ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cntGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#00e5ff" strokeWidth={2} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="count"   stroke="#a855f7" strokeWidth={1.5} fill="url(#cntGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment breakdown pie */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Payment Methods</h3>
          {payments.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={payments} cx="50%" cy="45%" outerRadius={68} dataKey="value" strokeWidth={2} stroke="transparent">
                  {payments.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name] || "#64748b"} />
                  ))}
                </Pie>
                <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12, textTransform: "capitalize" }}>{v}</span>} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]}
                  contentStyle={{ background: "#0d1526", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="glass rounded-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-white">Recent Bookings</h3>
          <a href="/dashboard/bookings" className="text-xs text-cyan hover:text-cyan/80">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {["Customer", "Service", "Time", "Status"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats?.recentBookings || []).map((b) => (
                <tr key={b._id} className="table-row">
                  <td className="py-3 px-4 text-slate-200 font-medium">{b.customerName}</td>
                  <td className="py-3 px-4 text-slate-400">{b.serviceName}</td>
                  <td className="py-3 px-4 text-slate-400">{b.timeSlot}</td>
                  <td className="py-3 px-4"><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                </tr>
              ))}
              {(!stats?.recentBookings?.length) && (
                <tr><td colSpan={4} className="text-center py-10 text-slate-500 text-sm">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
