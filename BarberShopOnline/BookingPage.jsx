// src/pages/BookingPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CalendarCheck, Clock, User, Phone, Mail, Scissors, Check, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { format, addDays, isBefore, startOfToday } from "date-fns";

const BARBERS = ["Any Available", "Raj", "Dev", "Sam"];

export default function BookingPage() {
  const { ownerId } = useParams();
  const [step,      setStep]     = useState(1); // 1=service, 2=slot, 3=info, 4=done
  const [services,  setServices] = useState([]);
  const [slots,     setSlots]    = useState({ available: [], bookedSlots: [] });
  const [selected,  setSelected] = useState({ service: null, date: new Date(), timeSlot: "", barber: "Any Available" });
  const [form,      setForm]     = useState({ name: "", phone: "", email: "", notes: "" });
  const [loading,   setLoading]  = useState(false);
  const [booking,   setBooking]  = useState(null);

  // Load services
  useEffect(() => {
    api.get(`/bookings/services-public?ownerId=${ownerId}`)
      .then((r) => setServices(r.data.services))
      .catch(() => toast.error("Shop not found"));
  }, [ownerId]);

  // Load slots when date changes
  useEffect(() => {
    if (step !== 2) return;
    const dateStr = format(selected.date, "yyyy-MM-dd");
    api.get(`/bookings/slots?date=${dateStr}&ownerId=${ownerId}`)
      .then((r) => setSlots(r.data))
      .catch(() => {});
  }, [selected.date, step, ownerId]);

  const submit = async () => {
    if (!form.name || !form.phone) { toast.error("Name and phone are required"); return; }
    setLoading(true);
    try {
      const res = await api.post("/bookings/public", {
        ownerId,
        customerName:  form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        serviceId:     selected.service._id,
        serviceName:   selected.service.name,
        servicePrice:  selected.service.price,
        barber:        selected.barber,
        date:          selected.date,
        timeSlot:      selected.timeSlot,
        notes:         form.notes,
      });
      setBooking(res.data.booking);
      setStep(4);
    } catch {
      toast.error("Booking failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (delta) => {
    const next = addDays(selected.date, delta);
    if (isBefore(next, startOfToday())) return;
    setSelected({ ...selected, date: next, timeSlot: "" });
  };

  if (step === 4 && booking) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="glass rounded-2xl p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
          <Check size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
        <p className="text-slate-400 mb-6">You'll receive a confirmation shortly.</p>
        <div className="bg-dark-700 rounded-xl p-5 text-left space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-400">Service</span><span className="text-white font-medium">{booking.serviceName}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Date</span><span className="text-white font-medium">{format(new Date(booking.date), "dd MMM yyyy")}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Time</span><span className="text-white font-medium">{booking.timeSlot}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Barber</span><span className="text-white font-medium">{booking.barber}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Price</span><span className="text-cyan font-bold">₹{booking.servicePrice}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="badge badge-pending">Pending</span></div>
        </div>
        <p className="text-xs text-slate-500 mt-4">Booking ID: {booking._id?.slice(-8).toUpperCase()}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 px-4 py-8"
         style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,229,255,0.06) 0%, transparent 50%)" }}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-gradient flex items-center justify-center shadow-glow-cyan">
              <span>💈</span>
            </div>
            <span className="font-display font-bold text-white text-lg">Book Appointment</span>
          </div>
          <div className="flex justify-center gap-2">
            {[1,2,3].map((s) => (
              <div key={s} className={`w-8 h-1.5 rounded-full transition-all ${step >= s ? "bg-cyan" : "bg-white/10"}`} />
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          {/* Step 1 — Select Service */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Choose a Service</h2>
              <p className="text-slate-400 text-sm mb-5">Select what you'd like today</p>
              <div className="space-y-2">
                {services.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No services available</p>}
                {services.map((svc) => (
                  <button key={svc._id} onClick={() => { setSelected({ ...selected, service: svc }); setStep(2); }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      selected.service?._id === svc._id
                        ? "border-cyan/40 bg-cyan/5 text-white"
                        : "border-white/[0.08] bg-dark-700 text-slate-300 hover:border-white/20"}`}>
                    <div className="flex items-center gap-3">
                      <Scissors size={16} className="text-cyan" />
                      <div className="text-left">
                        <p className="font-medium">{svc.name}</p>
                        <p className="text-xs text-slate-500">{svc.duration} min</p>
                      </div>
                    </div>
                    <span className="font-bold text-cyan">₹{svc.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Select Slot */}
          {step === 2 && (
            <div>
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-4">
                <ChevronLeft size={14} /> Back
              </button>
              <h2 className="text-lg font-bold text-white mb-1">Pick a Date & Time</h2>
              <p className="text-slate-400 text-sm mb-4">Service: <span className="text-cyan">{selected.service?.name}</span></p>

              {/* Date picker */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => changeDate(-1)} className="btn-ghost p-2"><ChevronLeft size={16} /></button>
                <div className="text-center">
                  <p className="text-white font-semibold">{format(selected.date, "EEEE")}</p>
                  <p className="text-slate-400 text-sm">{format(selected.date, "dd MMM yyyy")}</p>
                </div>
                <button onClick={() => changeDate(1)} className="btn-ghost p-2"><ChevronRight size={16} /></button>
              </div>

              {/* Barber */}
              <div className="mb-4">
                <label className="text-xs font-medium text-slate-400 block mb-2">Barber preference</label>
                <div className="flex gap-2 flex-wrap">
                  {BARBERS.map((b) => (
                    <button key={b} onClick={() => setSelected({ ...selected, barber: b })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selected.barber === b ? "border-cyan/40 bg-cyan/10 text-cyan" : "border-white/10 text-slate-400 hover:border-white/20"}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">Available slots</label>
                <div className="grid grid-cols-4 gap-2">
                  {slots.available.map((slot) => (
                    <button key={slot} onClick={() => setSelected({ ...selected, timeSlot: slot })}
                      className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                        selected.timeSlot === slot
                          ? "border-cyan/40 bg-cyan/10 text-cyan"
                          : "border-white/10 text-slate-300 hover:border-white/25"}`}>
                      {slot}
                    </button>
                  ))}
                  {slots.available.length === 0 && (
                    <p className="col-span-4 text-center text-slate-500 text-sm py-4">No slots available for this day</p>
                  )}
                </div>
              </div>

              <button onClick={() => setStep(3)} disabled={!selected.timeSlot}
                className="btn-primary w-full justify-center mt-5 disabled:opacity-40 disabled:cursor-not-allowed">
                Continue
              </button>
            </div>
          )}

          {/* Step 3 — Customer info */}
          {step === 3 && (
            <div>
              <button onClick={() => setStep(2)} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-4">
                <ChevronLeft size={14} /> Back
              </button>
              <h2 className="text-lg font-bold text-white mb-1">Your Details</h2>
              <p className="text-slate-400 text-sm mb-5">
                {selected.service?.name} · {format(selected.date, "dd MMM")} · {selected.timeSlot}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Full Name *</label>
                  <input type="text" className="field" placeholder="Arjun Mehta" required
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Phone *</label>
                  <input type="tel" className="field" placeholder="9876543210" required
                    value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Email (optional)</label>
                  <input type="email" className="field" placeholder="arjun@email.com"
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Notes (optional)</label>
                  <textarea className="field resize-none" rows={2} placeholder="Any special requests?"
                    value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>

              {/* Summary */}
              <div className="mt-5 p-4 bg-dark-700 rounded-xl border border-white/[0.06] space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Service</span><span className="text-white">{selected.service?.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Date & Time</span><span className="text-white">{format(selected.date, "dd MMM")} · {selected.timeSlot}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Barber</span><span className="text-white">{selected.barber}</span></div>
                <div className="flex justify-between font-semibold"><span className="text-slate-400">Price</span><span className="text-cyan">₹{selected.service?.price}</span></div>
              </div>

              <button onClick={submit} disabled={loading} className="btn-primary w-full justify-center mt-5">
                {loading ? "Confirming…" : "Confirm Booking"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
