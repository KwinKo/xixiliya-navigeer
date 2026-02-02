import type { User } from '@/types';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  user: User | null;
  requireAdmin?: boolean;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  user,
  requireAdmin = false,
  children,
}) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.username !== 'KwinKo') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
