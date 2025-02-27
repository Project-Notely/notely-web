import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '1rem', 
      backgroundColor: '#f5f5f5' 
    }}>
      <div>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none' }}>
          Notely
        </Link>
      </div>
      <div>
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Hello, {user?.name}</span>
            <button 
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
              Log Out
            </button>
          </div>
        ) : (
          <button 
            onClick={() => loginWithRedirect()}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Log In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 