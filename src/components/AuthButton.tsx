import { useAuth0 } from "@auth0/auth0-react";

const AuthButton = () => {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return isAuthenticated ? (
    <button
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    >
      Logout
    </button>
  ) : (
    <button onClick={() => loginWithRedirect()}>Login</button>
  );
};

export default AuthButton;
