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

export default function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/kyc" element={<KYC />} />
        <Route path="/success" element={<Success />} />
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
