// src/pages/ServicesPage.jsx
import { useEffect, useState, useCallback } from "react";
import { Scissors, Plus, Edit2, Trash2, Clock, ToggleLeft, ToggleRight } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";

const CATS = ["haircut","beard","grooming","combo","other"];
const CAT_COLORS = {
  haircut:  "bg-cyan/10 text-cyan border-cyan/20",
  beard:    "bg-violet/10 text-violet-400 border-violet/20",
  grooming: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  combo:    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  other:    "bg-white/5 text-slate-400 border-white/10",
};
const EMPTY_FORM = { name: "", price: "", duration: 30, description: "", category: "haircut", isActive: true };

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [active,   setActive]   = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/services");
      setServices(res.data.services);
    } catch { toast.error("Failed to load services"); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => { setForm(EMPTY_FORM); setActive(null); setModal("form"); };
  const openEdit = (s) => {
    setActive(s);
    setForm({ name: s.name, price: String(s.price), duration: s.duration, description: s.description || "", category: s.category, isActive: s.isActive });
    setModal("form");
  };

  const save = async () => {
    if (!form.name || !form.price) { toast.error("Name and price required"); return; }
    setSaving(true);
    try {
      if (active) {
        await api.put(`/services/${active._id}`, { ...form, price: parseFloat(form.price) });
        toast.success("Service updated");
      } else {
        await api.post("/services", { ...form, price: parseFloat(form.price) });
        toast.success("Service added");
      }
      setModal(null);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm("Delete this service?")) return;
    try { await api.delete(`/services/${id}`); toast.success("Deleted"); fetch(); }
    catch { toast.error("Delete failed"); }
  };

  const toggle = async (s) => {
    try {
      await api.put(`/services/${s._id}`, { ...s, isActive: !s.isActive });
      toast.success(s.isActive ? "Service deactivated" : "Service activated");
      fetch();
    } catch { toast.error("Update failed"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Services</h1>
          <p className="text-slate-400 text-sm mt-0.5">{services.length} services configured</p>
        </div>
        <button onClick={openAdd} className="btn-primary self-start sm:self-auto">
          <Plus size={15} /> Add Service
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="glass rounded-2xl">
          <EmptyState icon={Scissors} title="No services yet"
            desc="Add the services your shop offers so customers can book them online."
            action={<button onClick={openAdd} className="btn-primary">Add First Service</button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s._id} className={`glass rounded-2xl p-5 group transition-all duration-300 hover:border-white/15 hover:-translate-y-0.5 ${!s.isActive ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between mb-3">
                <span className={`badge capitalize border ${CAT_COLORS[s.category]}`}>{s.category}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggle(s)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all" title={s.isActive ? "Deactivate" : "Activate"}>
                    {s.isActive ? <ToggleRight size={16} className="text-cyan" /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-cyan/10 text-slate-400 hover:text-cyan transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => del(s._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="text-white font-semibold text-base mb-1">{s.name}</h3>
              {s.description && <p className="text-slate-500 text-xs mb-3 line-clamp-2">{s.description}</p>}

              <div className="flex items-center justify-between mt-auto">
                <span className="text-2xl font-bold font-display text-cyan">₹{s.price}</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={12} />{s.duration} min
                </div>
              </div>

              {!s.isActive && (
                <div className="mt-3 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 text-center">
                  Inactive — hidden from booking page
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {modal === "form" && (
        <Modal title={active ? "Edit Service" : "Add Service"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Service Name *</label>
              <input type="text" className="field" placeholder="Classic Haircut"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Price (₹) *</label>
                <input type="number" min="0" className="field" placeholder="150"
                  value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Duration (min)</label>
                <input type="number" min="5" max="300" className="field" placeholder="30"
                  value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 30 })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Category</label>
                <select className="field capitalize" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATS.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Description</label>
              <textarea className="field resize-none" rows={2} placeholder="Optional description…"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-10 h-5 rounded-full transition-colors ${form.isActive ? "bg-cyan" : "bg-white/10"} relative`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-slate-400">Show on booking page</span>
              <input type="checkbox" className="hidden" checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? "Saving…" : active ? "Save Changes" : "Add Service"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
