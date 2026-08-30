import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import ReceiptDetail from './pages/ReceiptDetail';
import PurchaseHistory from './pages/PurchaseHistory';
import AIChat from './pages/AIChat';
import WarrantyTracker from './pages/WarrantyTracker';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  return user ? <Navigate to="/dashboard" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Navbar /><Dashboard /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Navbar /><Upload /></ProtectedRoute>} />
      <Route path="/receipt/:id" element={<ProtectedRoute><Navbar /><ReceiptDetail /></ProtectedRoute>} />
      <Route path="/purchases" element={<ProtectedRoute><Navbar /><PurchaseHistory /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Navbar /><AIChat /></ProtectedRoute>} />
      <Route path="/warranties" element={<ProtectedRoute><Navbar /><WarrantyTracker /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Navbar /><Analytics /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Navbar /><Profile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', background: '#1f2937', color: '#fff' } }} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
