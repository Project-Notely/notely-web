import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Add a loading spinner or placeholder

  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;