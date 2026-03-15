// src/components/DashboardLayout.jsx
import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, CalendarCheck, ReceiptText,
  Scissors, BarChart2, Bell, LogOut, Menu, X,
  ChevronRight, Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import clsx from "clsx";

const NAV = [
  { to: "/dashboard",             icon: LayoutDashboard, label: "Overview" },
  { to: "/dashboard/bookings",    icon: CalendarCheck,   label: "Bookings" },
  { to: "/dashboard/customers",   icon: Users,           label: "Customers" },
  { to: "/dashboard/transactions",icon: ReceiptText,     label: "Transactions" },
  { to: "/dashboard/services",    icon: Scissors,        label: "Services" },
  { to: "/dashboard/analytics",   icon: BarChart2,       label: "Analytics" },
  { to: "/dashboard/reminders",   icon: Bell,            label: "Reminders" },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* ── Mobile Overlay ── */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={clsx(
        "fixed top-0 left-0 h-full z-40 w-64 flex flex-col",
        "bg-dark-800 border-r border-white/[0.06]",
        "transition-transform duration-300 lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-5 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-gradient flex items-center justify-center shadow-glow-cyan">
              <span className="text-lg">💈</span>
            </div>
            <span className="font-display font-bold text-white text-lg">BarberOS</span>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Shop info */}
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <p className="text-xs text-slate-500 mb-1">Logged in as</p>
          <p className="text-sm font-semibold text-white truncate">{user?.shopName || "My Shop"}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              onClick={() => setOpen(false)}
              className={({ isActive }) => clsx("nav-item", isActive && "active")}
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom: booking link + logout */}
        <div className="p-4 space-y-2 border-t border-white/[0.06]">
          <a
            href={`/book/${user?.id}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium
                       bg-cyan/10 text-cyan border border-cyan/20 hover:bg-cyan/15 transition-all"
          >
            <Zap size={13} />
            <span>Your Booking Page</span>
            <ChevronRight size={13} className="ml-auto" />
          </a>
          <button onClick={handleLogout} className="nav-item w-full text-red-400 hover:bg-red-500/5 hover:text-red-300">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-14 bg-dark-800/80 backdrop-blur border-b border-white/[0.06] px-4 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-gradient flex items-center justify-center text-sm font-bold text-white">
              {user?.ownerName?.[0] || "U"}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-white leading-tight">{user?.ownerName}</p>
              <p className="text-xs text-slate-500 leading-tight">Owner</p>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 md:p-6 page-enter overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
