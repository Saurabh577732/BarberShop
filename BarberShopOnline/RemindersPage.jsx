// src/pages/RemindersPage.jsx
import { useEffect, useState, useCallback } from "react";
import { Bell, MessageSquare, Phone, Send, RefreshCw, Clock, AlertTriangle, CheckCircle2, User } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";

const URGENCY = {
  high:   { label: "Overdue 60+ days", color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",    dot: "bg-red-400" },
  medium: { label: "Overdue 30+ days", color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
  low:    { label: "Visit soon",       color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  new:    { label: "New customer",     color: "text-violet-400",  bg: "bg-violet/10 border-violet/20",      dot: "bg-violet-400" },
};

const DEFAULT_MSG = (name) =>
  `Hi ${name}! 👋 It's been a while since your last visit at our shop.\n\nTime for a fresh cut? 💈 Book your slot now — we've got great new styles for you!\n\nReply to this message to book. 📅`;

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [days,      setDays]      = useState(30);
  const [preview,   setPreview]   = useState(null);
  const [msgText,   setMsgText]   = useState("");
  const [sending,   setSending]   = useState(false);
  const [sent,      setSent]      = useState(new Set());
  const [simResult, setSimResult] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reminders?days=${days}`);
      setReminders(res.data.reminders);
    } catch { toast.error("Failed to load reminders"); }
    finally  { setLoading(false); }
  }, [days]);

  useEffect(() => { fetch(); }, [fetch]);

  const openPreview = (c) => {
    setPreview(c);
    setMsgText(DEFAULT_MSG(c.name));
    setSimResult(null);
  };

  const sendReminder = async () => {
    setSending(true);
    try {
      const res = await api.post("/reminders/simulate", {
        customerId: preview._id,
        type: "whatsapp",
        message: msgText,
      });
      const notif = res.data.notification;
      setSimResult(notif);
      setSent((prev) => new Set(prev).add(preview._id));
      toast.success(`Reminder simulated for ${preview.name}`);
    } catch { toast.error("Failed to send reminder"); }
    finally { setSending(false); }
  };

  const urgencyCounts = reminders.reduce((acc, r) => {
    acc[r.urgency] = (acc[r.urgency] || 0) + 1; return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Service Reminders</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {reminders.length} customers due for a visit
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 bg-dark-700 rounded-xl border border-white/[0.06]">
            {[14,30,60,90].map((d) => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  days === d ? "bg-cyan/15 text-cyan border border-cyan/25" : "text-slate-400 hover:text-white"}`}>
                {d}d
              </button>
            ))}
          </div>
          <button onClick={fetch} className="btn-ghost text-xs gap-1.5">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Urgency summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(URGENCY).map(([key, cfg]) => (
          <div key={key} className={`glass rounded-xl p-4 border ${cfg.bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
            </div>
            <p className={`text-2xl font-bold font-display ${cfg.color}`}>{urgencyCounts[key] || 0}</p>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="glass rounded-xl p-4 border-cyan/20 bg-cyan/[0.03] flex gap-3 items-start">
        <Bell size={16} className="text-cyan mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-slate-300 font-medium">How Reminders Work</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Customers listed here haven't visited in {days}+ days. Click "Send Reminder" to simulate a WhatsApp/SMS notification.
            In production, integrate Twilio or WhatsApp Business API in <code className="text-cyan text-xs">server/routes/reminders.js</code>.
          </p>
        </div>
      </div>

      {/* Customers list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="glass rounded-2xl">
          <EmptyState icon={Bell} title="All customers are up to date!"
            desc="No customers are overdue for a visit at this threshold." />
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Customer","Phone","Last Visit","Days Since","Visits","Spent","Urgency","Action"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reminders.map((r) => {
                  const urg = URGENCY[r.urgency];
                  const wasSent = sent.has(r._id);
                  return (
                    <tr key={r._id} className="table-row group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-violet-gradient flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {r.name[0].toUpperCase()}
                          </div>
                          <span className="text-slate-200 font-medium">{r.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{r.phone}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {r.lastVisit ? format(new Date(r.lastVisit), "dd MMM yyyy") : "Never"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${urg.color}`}>
                          {r.daysSince !== null ? `${r.daysSince}d` : "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-center">{r.totalVisits}</td>
                      <td className="py-3 px-4 text-cyan font-semibold">₹{(r.totalSpent || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`badge border capitalize ${urg.bg} ${urg.color}`}>{r.urgency}</span>
                      </td>
                      <td className="py-3 px-4">
                        {wasSent ? (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <CheckCircle2 size={13} /> Sent
                          </span>
                        ) : (
                          <button onClick={() => openPreview(r)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                       bg-green-500/10 border border-green-500/20 text-emerald-400 hover:bg-green-500/20 transition-all">
                            <Send size={12} /> Remind
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview / Send Modal */}
      {preview && (
        <Modal title="Send Reminder" onClose={() => setPreview(null)} size="md">
          <div className="space-y-4">
            {/* Customer summary */}
            <div className="flex items-center gap-3 p-3 bg-dark-700 rounded-xl border border-white/[0.06]">
              <div className="w-10 h-10 rounded-full bg-violet-gradient flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {preview.name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{preview.name}</p>
                <p className="text-slate-500 text-xs flex items-center gap-1">
                  <Phone size={10} /> {preview.phone}
                  {preview.lastVisit && (
                    <> · Last visit: {formatDistanceToNow(new Date(preview.lastVisit), { addSuffix: true })}</>
                  )}
                </p>
              </div>
            </div>

            {/* Message editor */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">
                Message Preview
                <span className="text-slate-600 font-normal ml-1">(WhatsApp / SMS)</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 text-green-400 opacity-60">
                  <MessageSquare size={14} />
                </div>
                <textarea
                  className="field pl-8 resize-none text-xs leading-relaxed"
                  rows={6}
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-600 mt-1">{msgText.length} characters</p>
            </div>

            {/* Simulation result */}
            {simResult && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">Reminder Simulated Successfully</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>To: <span className="text-white">{simResult.to}</span></p>
                  <p>Type: <span className="text-white capitalize">{simResult.type}</span></p>
                  <p>Status: <span className="text-emerald-400 capitalize">{simResult.status}</span></p>
                  <p>Sent at: <span className="text-white">{format(new Date(simResult.sentAt), "dd MMM yyyy · hh:mm a")}</span></p>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  💡 To send real messages, integrate Twilio / WhatsApp Business API in the backend.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={() => setPreview(null)} className="btn-ghost flex-1 justify-center">Close</button>
              {!simResult && (
                <button onClick={sendReminder} disabled={sending}
                  className="btn-primary flex-1 justify-center bg-green-gradient">
                  <Send size={14} />
                  {sending ? "Sending…" : "Send via WhatsApp"}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
