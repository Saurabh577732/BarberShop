// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import LandingPage     from "./pages/LandingPage";
import LoginPage       from "./pages/LoginPage";
import RegisterPage    from "./pages/RegisterPage";
import BookingPage     from "./pages/BookingPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome   from "./pages/DashboardHome";
import CustomersPage   from "./pages/CustomersPage";
import BookingsPage    from "./pages/BookingsPage";
import TransactionsPage from "./pages/TransactionsPage";
import ServicesPage    from "./pages/ServicesPage";
import RemindersPage   from "./pages/RemindersPage";
import AnalyticsPage   from "./pages/AnalyticsPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="text-cyan animate-pulse text-lg">Loading…</span></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/"        element={<LandingPage />} />
        <Route path="/book/:ownerId" element={<BookingPage />} />
        <Route path="/login"   element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Protected dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index         element={<DashboardHome />} />
          <Route path="customers"    element={<CustomersPage />} />
          <Route path="bookings"     element={<BookingsPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="services"     element={<ServicesPage />} />
          <Route path="analytics"    element={<AnalyticsPage />} />
          <Route path="reminders"    element={<RemindersPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
