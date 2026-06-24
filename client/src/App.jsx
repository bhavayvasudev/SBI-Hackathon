import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing.jsx';
import Chat from './pages/Chat.jsx';
import KYC from './pages/KYC.jsx';
import Success from './pages/Success.jsx';
import Dashboard from './pages/Dashboard.jsx';

function ProtectedRoute({ children }) {
  if (sessionStorage.getItem('hyperone_auth') !== '1') {
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
        <Route path="/chat" element={<Chat />} />
        <Route path="/kyc" element={<KYC />} />
        <Route path="/success" element={<Success />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}
