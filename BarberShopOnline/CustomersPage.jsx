// src/pages/CustomersPage.jsx
import { useEffect, useState, useCallback } from "react";
import { Users, Plus, Search, Edit2, Trash2, Phone, Mail, History, X } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import { format } from "date-fns";

const EMPTY_FORM = { name: "", phone: "", email: "", notes: "" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [modal,     setModal]     = useState(null); // "add" | "edit" | "view"
  const [active,    setActive]    = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?search=${search}`);
      setCustomers(res.data.customers);
    } catch { toast.error("Failed to load customers"); }
    finally  { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const openAdd = () => { setForm(EMPTY_FORM); setModal("add"); };
  const openEdit = (c) => { setActive(c); setForm({ name: c.name, phone: c.phone, email: c.email || "", notes: c.notes || "" }); setModal("edit"); };
  const openView = (c) => { setActive(c); setModal("view"); };

  const save = async () => {
    if (!form.name || !form.phone) { toast.error("Name and phone required"); return; }
    setSaving(true);
    try {
      if (modal === "add") {
        await api.post("/customers", form);
        toast.success("Customer added");
      } else {
        await api.put(`/customers/${active._id}`, form);
        toast.success("Customer updated");
      }
      setModal(null);
      fetchCustomers();
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm("Delete this customer?")) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success("Customer removed");
      fetchCustomers();
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="text-slate-400 text-sm mt-0.5">{customers.length} total customers</p>
        </div>
        <button onClick={openAdd} className="btn-primary self-start sm:self-auto">
          <Plus size={15} /> Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" className="field pl-9" placeholder="Search by name or phone…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table card */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState icon={Users} title="No customers yet"
            desc="Add your first customer to start tracking visits and history."
            action={<button onClick={openAdd} className="btn-primary">Add Customer</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Customer", "Phone", "Last Visit", "Visits", "Total Spent", "Actions"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id} className="table-row group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-gradient flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {c.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-200 font-medium">{c.name}</p>
                          {c.email && <p className="text-xs text-slate-500">{c.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{c.phone}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {c.lastVisit ? format(new Date(c.lastVisit), "dd MMM yyyy") : "Never"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-violet/10 border border-violet/20 text-violet-light text-xs font-semibold">
                        {c.visits?.length || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-cyan font-semibold">₹{(c.totalSpent || 0).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openView(c)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all" title="View history">
                          <History size={14} />
                        </button>
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-cyan/10 text-slate-400 hover:text-cyan transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => del(c._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all">
                          <Trash2 size={14} />
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

      {/* Add / Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add Customer" : "Edit Customer"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Full Name *</label>
              <input type="text" className="field" placeholder="Arjun Mehta"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Phone *</label>
                <input type="tel" className="field" placeholder="9876543210"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Email</label>
                <input type="email" className="field" placeholder="optional"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Notes</label>
              <textarea className="field resize-none" rows={2} placeholder="Allergies, preferences…"
                value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? "Saving…" : modal === "add" ? "Add Customer" : "Save Changes"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View History Modal */}
      {modal === "view" && active && (
        <Modal title={`${active.name}'s History`} onClose={() => setModal(null)} size="lg">
          <div className="space-y-4">
            {/* Customer info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-400"><Phone size={13} />{active.phone}</div>
              {active.email && <div className="flex items-center gap-2 text-slate-400"><Mail size={13} />{active.email}</div>}
              <div className="text-slate-400">Total Spent: <span className="text-cyan font-bold">₹{(active.totalSpent || 0).toLocaleString()}</span></div>
              <div className="text-slate-400">Total Visits: <span className="text-white font-semibold">{active.visits?.length || 0}</span></div>
            </div>
            {/* Visit history */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Visit History</h4>
              {(!active.visits || active.visits.length === 0) ? (
                <p className="text-center text-slate-500 py-8 text-sm">No visits recorded</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {[...active.visits].sort((a,b) => new Date(b.date)-new Date(a.date)).map((v, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-dark-700 rounded-xl border border-white/[0.06]">
                      <div>
                        <p className="text-sm font-medium text-slate-200">{v.service}</p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(v.date), "dd MMM yyyy")} · {v.barber || "Unknown barber"}
                        </p>
                      </div>
                      <span className="text-cyan font-bold text-sm">₹{v.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
