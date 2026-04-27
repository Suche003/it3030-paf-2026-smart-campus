import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const redirectByRole = (role) => {
    const routes = {
      ADMIN: "/admin",
      STUDENT: "/student",
      LECTURER: "/lecturer",
      TECHNICIAN: "/technician",
    };

    window.location.replace(routes[role] || "/login");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role");
    const googleEmail = params.get("email");
    const userId = params.get("id");
    const name = params.get("name");

    if (token && role) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (googleEmail) {
        localStorage.setItem("email", googleEmail);
      } else {
        localStorage.removeItem("email");
      }

      if (userId) {
        localStorage.setItem("userId", userId);
      }

      if (name) {
        localStorage.setItem("name", name);
      }

      redirectByRole(role);
    }
  }, []);

  const handleLogin = async () => {
    setError("");

    try {
      const res = await loginUser({ email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.id);
      localStorage.setItem("name", res.data.name || "");
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("user", JSON.stringify(res.data));

      redirectByRole(res.data.role);
    } catch {
      setError("Invalid email or password");
    }
  };

  const googleLogin = () => {
    window.location.href = "http://localhost:8081/oauth2/authorization/google";
  };

  const facebookLogin = () => {
    window.location.href = "http://localhost:8081/oauth2/authorization/facebook";
  };

  return (
    <div className="login-wrapper">
      <button className="auth-back-btn" onClick={() => navigate("/")}>
        ↩ Go Back
      </button>

      <div className="login-header">
        <h1>
          Welcome back to <span>UniGo</span>
        </h1>
      </div>

      <div className="login-box">
        <h2>Login</h2>

        <label>Email</label>
        <input
          placeholder="Enter email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />

        {error && <p className="auth-error">{error}</p>}

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

        <button className="google-btn" onClick={googleLogin}>
          <span className="google-icon">G</span>
          Login with Google
        </button>

        <button className="facebook-btn" onClick={facebookLogin}>
          <div className="facebook-icon">f</div>
          Continue with Facebook
        </button>

        <p className="auth-switch">
          New to UniGo? <a href="/register">Create an account</a>
        </p>
      </div>
    </div>
  );
}

export default Login;