import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing.jsx';
import Register from './pages/Register.jsx';
import Chat from './pages/Chat.jsx';
import KYC from './pages/KYC.jsx';
import Success from './pages/Success.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';

function AdminRoute({ children }) {
  if (sessionStorage.getItem('hyperone_role') !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}

function CustomerRoute({ children }) {
  const token = localStorage.getItem('hyperone_customer_token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Redirect already-authenticated customers away from public/onboarding pages
function PublicOnlyRoute({ children }) {
  const token = localStorage.getItem('hyperone_customer_token');
  if (token) {
    return <Navigate to="/my-dashboard" replace />;
  }
  return children;
}

export default function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/chat" element={<PublicOnlyRoute><Chat /></PublicOnlyRoute>} />
        <Route path="/kyc" element={<PublicOnlyRoute><KYC /></PublicOnlyRoute>} />
        <Route path="/success" element={<PublicOnlyRoute><Success /></PublicOnlyRoute>} />
        <Route path="/dashboard" element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        } />
        <Route path="/my-dashboard" element={
          <CustomerRoute>
            <CustomerDashboard />
          </CustomerRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}
