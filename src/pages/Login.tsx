import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./config/firebaseConfig";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User signed up:", userCredential.user);
      navigate("/editor");
    } catch (error: any) {
      setError(error.message);
      console.error("Sign Up Error:", error.code, error.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User signed in:", userCredential.user);
      navigate("/editor");
    } catch (error: any) {
      setError(error.message);
      console.error("Login Error:", error.code, error.message);
    }
  };

  const handleGoogleLogin = async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    event.preventDefault();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      setError(error.message);
      console.error("Google Login Error:", error.code, error.message);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/editor");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div
      className="login-container"
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        margin: "auto",
        maxWidth: "20%",
        padding: "20px",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleLogin}>
        <div style={{ textAlign: "center" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              margin: "15px auto",
              height: "30px",
              borderRadius: "8px",
              display: "block",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              margin: "15px auto",
              height: "30px",
              borderRadius: "8px",
              display: "block",
            }}
          />
        </div>
        <div className="button-group">
          <button type="submit">Login</button>
          <button type="button" onClick={handleSignUp}>
            Sign Up
          </button>
          <button type="button" onClick={handleGoogleLogin}>
            <img src="google-icon.png" alt="Google Login" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
