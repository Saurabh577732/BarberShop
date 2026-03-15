// src/pages/TransactionsPage.jsx
import { useEffect, useState, useCallback } from "react";
import { ReceiptText, Plus, Search, Trash2, X, IndianRupee, Filter } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import { format } from "date-fns";

const METHODS  = ["all", "cash", "upi", "card", "other"];
const PAY_COLORS = { cash: "text-cyan bg-cyan/10 border-cyan/20", upi: "text-violet-400 bg-violet/10 border-violet/20", card: "text-amber-400 bg-amber-500/10 border-amber-500/20", other: "text-slate-400 bg-white/5 border-white/10" };
const EMPTY_FORM = { customerName: "", customerPhone: "", serviceName: "", price: "", paymentMethod: "cash", barber: "", notes: "" };

export default function TransactionsPage() {
  const [txs,      setTxs]      = useState([]);
  const [services, setServices] = useState([]);
  const [summary,  setSummary]  = useState({ totalRevenue: 0, count: 0 });
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [method,   setMethod]   = useState("all");
  const [startDate,setStartDate]= useState("");
  const [endDate,  setEndDate]  = useState("");
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search)    p.set("search", search);
      if (method !== "all") p.set("method", method);
      if (startDate) p.set("startDate", startDate);
      if (endDate)   p.set("endDate",   endDate);
      const res = await api.get(`/transactions?${p}`);
      setTxs(res.data.transactions);
      setSummary(res.data.summary);
    } catch { toast.error("Failed to load transactions"); }
    finally  { setLoading(false); }
  }, [search, method, startDate, endDate]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { api.get("/services").then((r) => setServices(r.data.services)).catch(() => {}); }, []);

  const save = async () => {
    if (!form.customerName || !form.serviceName || !form.price) { toast.error("Fill required fields"); return; }
    setSaving(true);
    try {
      await api.post("/transactions", { ...form, price: parseFloat(form.price) });
      toast.success("Transaction logged");
      setModal(false);
      setForm(EMPTY_FORM);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    try { await api.delete(`/transactions/${id}`); toast.success("Deleted"); fetch(); }
    catch { toast.error("Delete failed"); }
  };

  const clearFilters = () => { setSearch(""); setMethod("all"); setStartDate(""); setEndDate(""); };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Transaction Ledger</h1>
          <p className="text-slate-400 text-sm mt-0.5">{summary.count} records · ₹{(summary.totalRevenue || 0).toLocaleString()} total</p>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setModal(true); }} className="btn-primary self-start sm:self-auto">
          <Plus size={15} /> Log Transaction
        </button>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", val: `₹${(summary.totalRevenue||0).toLocaleString()}`, color: "text-cyan" },
          { label: "Total Records", val: summary.count || 0, color: "text-violet-400" },
          { label: "Avg Ticket",    val: summary.count ? `₹${Math.round((summary.totalRevenue||0)/summary.count)}` : "—", color: "text-emerald-400" },
          { label: "Filtered",      val: txs.length, color: "text-amber-400" },
        ].map(({ label, val, color }) => (
          <div key={label} className="glass rounded-xl p-4">
            <p className={`text-xl font-bold font-display ${color}`}>{val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" className="field pl-8 max-w-[200px]" placeholder="Search…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 p-1 bg-dark-700 rounded-xl border border-white/[0.06]">
          {METHODS.map((m) => (
            <button key={m} onClick={() => setMethod(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                method === m ? "bg-cyan/15 text-cyan border border-cyan/25" : "text-slate-400 hover:text-white"}`}>
              {m}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <input type="date" className="field max-w-[150px] text-xs" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <span className="text-slate-500 text-xs">to</span>
          <input type="date" className="field max-w-[150px] text-xs" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        {(search || method !== "all" || startDate || endDate) && (
          <button onClick={clearFilters} className="btn-ghost text-xs gap-1"><X size={12} />Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
          </div>
        ) : txs.length === 0 ? (
          <EmptyState icon={ReceiptText} title="No transactions yet"
            desc="Log your first transaction to start tracking revenue."
            action={<button onClick={() => setModal(true)} className="btn-primary">Log Transaction</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Date","Customer","Service","Barber","Amount","Payment","Actions"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txs.map((t) => (
                  <tr key={t._id} className="table-row group">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {format(new Date(t.date), "dd MMM yyyy")}
                      <p className="text-xs text-slate-600">{format(new Date(t.date), "hh:mm a")}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-200 font-medium">{t.customerName}</p>
                      {t.customerPhone && <p className="text-xs text-slate-500">{t.customerPhone}</p>}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{t.serviceName}</td>
                    <td className="py-3 px-4 text-slate-400">{t.barber || "—"}</td>
                    <td className="py-3 px-4">
                      <span className="text-cyan font-bold text-base">₹{t.price.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge capitalize border ${PAY_COLORS[t.paymentMethod] || PAY_COLORS.other}`}>
                        {t.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => del(t._id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/[0.08] bg-white/[0.02]">
                  <td colSpan={4} className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Total ({txs.length} records)</td>
                  <td className="py-3 px-4 text-cyan font-bold">
                    ₹{txs.reduce((s,t)=>s+t.price,0).toLocaleString()}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <Modal title="Log Transaction" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Customer Name *</label>
                <input type="text" className="field" value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Phone</label>
                <input type="tel" className="field" value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Service *</label>
              <select className="field" value={form.serviceName}
                onChange={(e) => {
                  const svc = services.find((s) => s.name === e.target.value);
                  setForm({ ...form, serviceName: e.target.value, price: svc ? String(svc.price) : form.price });
                }}>
                <option value="">Select service…</option>
                {services.map((s) => <option key={s._id} value={s.name}>{s.name}</option>)}
                <option value="Other">Other (enter manually)</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Price (₹) *</label>
                <input type="number" min="0" className="field" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Payment</label>
                <select className="field" value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Barber</label>
                <select className="field" value={form.barber}
                  onChange={(e) => setForm({ ...form, barber: e.target.value })}>
                  <option value="">Any</option>
                  {["Raj","Dev","Sam"].map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Notes</label>
              <textarea className="field resize-none" rows={2} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? "Saving…" : "Log Transaction"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
