import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '80vh' 
    }}>
      <h1>Welcome to Notely</h1>
      <p>Your personal document workspace</p>
      <button 
        onClick={() => loginWithRedirect()}
        style={{ 
          padding: '0.75rem 1.5rem', 
          fontSize: '1rem', 
          backgroundColor: '#0070f3', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer',
          marginTop: '2rem'
        }}
      >
        Log In with Auth0
      </button>
    </div>
  );
};

export default Login;
