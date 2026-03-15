// src/pages/BookingsPage.jsx
import { useEffect, useState, useCallback } from "react";
import {
  CalendarCheck, Plus, Search, Check, X, Clock, Filter,
  ChevronDown, Trash2, Edit2,
} from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import { format } from "date-fns";

const STATUSES = ["all", "pending", "confirmed", "completed", "cancelled"];
const BARBERS  = ["Any Available", "Raj", "Dev", "Sam"];

export default function BookingsPage() {
  const [bookings, setBookings]   = useState([]);
  const [services, setServices]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [filter,   setFilter]     = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [modal,    setModal]      = useState(null);
  const [active,   setActive]     = useState(null);
  const [form,     setForm]       = useState({});
  const [saving,   setSaving]     = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      if (dateFilter) params.set("date", dateFilter);
      const res = await api.get(`/bookings?${params}`);
      setBookings(res.data.bookings);
    } catch { toast.error("Failed to load bookings"); }
    finally  { setLoading(false); }
  }, [filter, dateFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  useEffect(() => {
    api.get("/services").then((r) => setServices(r.data.services)).catch(() => {});
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch { toast.error("Update failed"); }
  };

  const del = async (id) => {
    if (!confirm("Delete this booking?")) return;
    try { await api.delete(`/bookings/${id}`); toast.success("Deleted"); fetchBookings(); }
    catch { toast.error("Delete failed"); }
  };

  const openAdd = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    setForm({ customerName: "", customerPhone: "", serviceName: "", servicePrice: 0, barber: "Any Available", date: today, timeSlot: "10:00", notes: "" });
    setModal("add");
  };

  const save = async () => {
    if (!form.customerName || !form.customerPhone || !form.serviceName) {
      toast.error("Fill required fields"); return;
    }
    setSaving(true);
    try {
      await api.post("/bookings", form);
      toast.success("Booking created");
      setModal(null);
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };

  const statusDot = { pending: "bg-amber-400", confirmed: "bg-cyan", completed: "bg-emerald-400", cancelled: "bg-red-400" };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="text-slate-400 text-sm mt-0.5">{bookings.length} appointments shown</p>
        </div>
        <button onClick={openAdd} className="btn-primary self-start sm:self-auto">
          <Plus size={15} /> New Booking
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1.5 p-1 bg-dark-700 rounded-xl border border-white/[0.06]">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === s ? "bg-cyan/15 text-cyan border border-cyan/25" : "text-slate-400 hover:text-white"}`}>
              {s}
            </button>
          ))}
        </div>
        <input type="date" className="field max-w-[160px] text-sm"
          value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
          placeholder="Filter by date" />
        {dateFilter && (
          <button onClick={() => setDateFilter("")} className="btn-ghost text-xs">
            <X size={12} /> Clear date
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No bookings found"
            desc="Create a booking or share your booking link with customers."
            action={<button onClick={openAdd} className="btn-primary">New Booking</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Customer","Service","Date & Time","Barber","Price","Status","Actions"].map((h)=>(
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="table-row group">
                    <td className="py-3 px-4">
                      <p className="text-slate-200 font-medium">{b.customerName}</p>
                      <p className="text-xs text-slate-500">{b.customerPhone}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{b.serviceName}</td>
                    <td className="py-3 px-4">
                      <p className="text-slate-300">{format(new Date(b.date), "dd MMM yyyy")}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={10} />{b.timeSlot}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{b.barber}</td>
                    <td className="py-3 px-4 text-cyan font-semibold">₹{b.servicePrice}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${statusDot[b.status]}`} />
                        <span className={`badge badge-${b.status}`}>{b.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {b.status === "pending" && (
                          <button onClick={() => updateStatus(b._id, "confirmed")} title="Confirm"
                            className="p-1.5 rounded-lg bg-cyan/10 text-cyan hover:bg-cyan/20 transition-all">
                            <Check size={13} />
                          </button>
                        )}
                        {(b.status === "confirmed" || b.status === "pending") && (
                          <button onClick={() => updateStatus(b._id, "completed")} title="Mark complete"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all">
                            <Check size={13} />
                          </button>
                        )}
                        {b.status !== "cancelled" && b.status !== "completed" && (
                          <button onClick={() => updateStatus(b._id, "cancelled")} title="Cancel"
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                            <X size={13} />
                          </button>
                        )}
                        <button onClick={() => del(b._id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add booking modal */}
      {modal === "add" && (
        <Modal title="New Booking" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Customer Name *</label>
                <input type="text" className="field" value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Phone *</label>
                <input type="tel" className="field" value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Service *</label>
              <select className="field" value={form.serviceName}
                onChange={(e) => {
                  const svc = services.find((s) => s.name === e.target.value);
                  setForm({ ...form, serviceName: e.target.value, servicePrice: svc?.price || 0 });
                }}>
                <option value="">Select service…</option>
                {services.map((s) => <option key={s._id} value={s.name}>{s.name} — ₹{s.price}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Date</label>
                <input type="date" className="field" value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Time Slot</label>
                <input type="time" className="field" value={form.timeSlot}
                  onChange={(e) => setForm({ ...form, timeSlot: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Barber</label>
                <select className="field" value={form.barber}
                  onChange={(e) => setForm({ ...form, barber: e.target.value })}>
                  {BARBERS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Notes</label>
              <textarea className="field resize-none" rows={2} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? "Creating…" : "Create Booking"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
