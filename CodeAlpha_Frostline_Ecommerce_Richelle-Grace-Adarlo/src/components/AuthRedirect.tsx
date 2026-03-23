import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import Index from '@/pages/Index';
import Home from '@/pages/Home';

export default function AuthRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  return isAuthenticated ? <Home /> : <Index />;
}
