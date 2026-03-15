// src/pages/LandingPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Scissors, Users, CalendarCheck, BarChart2, Bell,
  ReceiptText, ChevronRight, Menu, X, Check, Zap,
  Shield, Smartphone, Star,
} from "lucide-react";

const FEATURES = [
  { icon: Users,         title: "Customer Management",    desc: "Profiles, visit history, spend tracking — every customer, beautifully organised.",      color: "cyan"   },
  { icon: CalendarCheck, title: "Slot Booking System",    desc: "Online bookings with real-time slot availability. No more phone-tag.",                   color: "violet" },
  { icon: BarChart2,     title: "Revenue Dashboard",      desc: "Daily, weekly, monthly revenue charts. Know your numbers at a glance.",                  color: "green"  },
  { icon: ReceiptText,   title: "Transaction Ledger",     desc: "Log every service, price & payment method. Search and filter history instantly.",        color: "amber"  },
  { icon: Bell,          title: "Service Reminders",      desc: "Auto-reminders when customers are due for their next cut. Increase retention.",           color: "pink"   },
  { icon: Zap,           title: "WhatsApp Notifications", desc: "Simulated booking confirmations & reminders sent straight to customers.",                 color: "cyan"   },
];

const COLORS = {
  cyan:   "bg-cyan/10 text-cyan border-cyan/20",
  violet: "bg-violet/10 text-violet-light border-violet/20",
  green:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  amber:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  pink:   "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

const PERKS = [
  "Free forever plan",
  "No credit card needed",
  "Deploy in minutes",
  "Open source friendly",
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-900 text-slate-200 overflow-x-hidden">
      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-dark-900/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-gradient flex items-center justify-center shadow-glow-cyan">
              <span className="text-sm">💈</span>
            </div>
            <span className="font-display font-bold text-white text-lg">BarberOS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how"      className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing"  className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"    className="btn-ghost text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started Free</Link>
          </div>

          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-dark-800 border-t border-white/[0.06] px-4 py-4 space-y-3">
            {["#features","#how","#pricing"].map((h) => (
              <a key={h} href={h} className="block text-sm text-slate-400 hover:text-white py-1"
                 onClick={() => setMenuOpen(false)}>
                {h.slice(1).charAt(0).toUpperCase() + h.slice(2)}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
              <Link to="/login"    className="btn-ghost justify-center">Sign In</Link>
              <Link to="/register" className="btn-primary justify-center">Get Started Free</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-4 relative" style={{ background: "radial-gradient(ellipse at 20% 40%, rgba(0,229,255,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(124,58,237,0.09) 0%, transparent 50%)" }}>
        {/* Floating dots */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-xs font-semibold mb-6">
            <Zap size={12} />
            Built for modern barber shops in India
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            The{" "}
            <span className="gradient-text">Smart OS</span>
            {" "}for Your<br />Barber Shop
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Replace paper, memory and chaos with digital bookings, customer records,
            revenue tracking and automated reminders — all in one place.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-10">
            <Link to="/register" className="btn-primary text-base px-7 py-3.5">
              Start Free <ChevronRight size={16} />
            </Link>
            <Link to="/login" className="btn-ghost text-base px-7 py-3.5">
              View Demo
            </Link>
          </div>

          {/* Perks */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {PERKS.map((p) => (
              <span key={p} className="flex items-center gap-1.5 text-sm text-slate-400">
                <Check size={13} className="text-emerald-400" /> {p}
              </span>
            ))}
          </div>
        </div>

        {/* Hero dashboard mockup */}
        <div className="max-w-5xl mx-auto mt-16 px-2">
          <div className="glass rounded-2xl border-white/10 overflow-hidden shadow-2xl">
            <div className="bg-dark-700 px-4 py-3 flex items-center gap-2 border-b border-white/[0.06]">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <span className="text-xs text-slate-500 ml-2">BarberOS Dashboard</span>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Today's Revenue",  val: "₹2,850", color: "text-cyan" },
                { label: "Bookings Today",   val: "12",      color: "text-violet-400" },
                { label: "Total Customers",  val: "248",     color: "text-emerald-400" },
                { label: "Pending Approval", val: "3",       color: "text-amber-400" },
              ].map((s) => (
                <div key={s.label} className="bg-dark-600 rounded-xl p-4 border border-white/[0.06]">
                  <p className={`text-xl font-bold font-display ${s.color}`}>{s.val}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="px-4 pb-4">
              <div className="bg-dark-600 rounded-xl border border-white/[0.06] p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400">RECENT BOOKINGS</span>
                  <span className="text-xs text-cyan">View all</span>
                </div>
                {[
                  ["Arjun Mehta",   "Classic Haircut", "10:00", "confirmed"],
                  ["Rohan Gupta",   "Fade + Design",   "10:30", "pending"],
                  ["Vikram Nair",   "Beard Trim",      "11:00", "completed"],
                ].map(([name, svc, time, status]) => (
                  <div key={name} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-violet-gradient flex items-center justify-center text-xs font-bold text-white">{name[0]}</div>
                      <div>
                        <p className="text-xs font-medium text-slate-200">{name}</p>
                        <p className="text-xs text-slate-500">{svc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{time}</span>
                      <span className={`badge badge-${status}`}>{status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-cyan text-xs font-semibold uppercase tracking-widest">Everything you need</span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mt-3 mb-4">
              Built for real barbershop owners
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">Every feature designed around the real daily challenges that shop owners face.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass rounded-2xl p-6 hover:border-white/15 hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${COLORS[color]}`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-cyan transition-colors">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-24 px-4 bg-dark-800/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4">Up and running in minutes</h2>
            <p className="text-slate-400">No technical knowledge required.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create your shop",    desc: "Register, add your services and set up your barber profiles in under 5 minutes." },
              { step: "02", title: "Share your book link", desc: "Share your unique booking URL with customers via WhatsApp or Instagram." },
              { step: "03", title: "Run your business",   desc: "Manage bookings, track revenue and send reminders all from one dashboard." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-cyan/10 border border-cyan/20 flex items-center justify-center mx-auto mb-5">
                  <span className="font-display font-bold text-cyan text-lg">{step}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-slate-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: Shield,     title: "Secure by default",   desc: "JWT auth, bcrypt passwords, owner-scoped data" },
            { icon: Smartphone, title: "Mobile-first",        desc: "Works beautifully on any device, any screen size" },
            { icon: Star,       title: "Production-ready",    desc: "Deploy on Vercel + MongoDB Atlas in one click" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass rounded-2xl p-6">
              <Icon size={28} className="text-cyan mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">{title}</h3>
              <p className="text-slate-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center glass rounded-3xl p-12 border-white/10">
          <span className="text-5xl mb-4 block">💈</span>
          <h2 className="font-display text-3xl font-extrabold text-white mb-4">Ready to go digital?</h2>
          <p className="text-slate-400 mb-8">Start managing your barber shop the smart way. Free, forever.</p>
          <Link to="/register" className="btn-primary text-base px-8 py-3.5">
            Create Your Shop — Free <ChevronRight size={16} />
          </Link>
          <p className="text-xs text-slate-500 mt-4">No credit card · No setup fee · Cancel anytime</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-8 px-4 text-center text-sm text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-lg">💈</span>
          <span className="font-display font-bold text-white">BarberOS</span>
        </div>
        <p>© 2025 BarberOS. Built with ❤️ for India's barbershops.</p>
        <div className="flex justify-center gap-4 mt-3 text-xs">
          <Link to="/login"    className="hover:text-white transition-colors">Sign In</Link>
          <Link to="/register" className="hover:text-white transition-colors">Register</Link>
        </div>
      </footer>
    </div>
  );
}
