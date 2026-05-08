import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner text="جاري التحقق..." /></div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
}
