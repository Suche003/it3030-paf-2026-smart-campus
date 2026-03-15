import { useState, useEffect } from "react";
import { loginUser } from "../services/authService";
import "./Login.css";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role");
    const googleEmail = params.get("email"); // 🔥 FIX for Google login

    if (token && role) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // 🔥 FIX: save email from Google login if exists
      if (googleEmail) {
        localStorage.setItem("email", googleEmail);
      }

      window.location.href = "/" + role.toLowerCase();
    }
  }, []);

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setError("Email is required");
      return false;
    }

    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return false;
    }

    if (!password) {
      setError("Password is required");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    setError("");
    return true;
  };

  const handleLogin = async () => {

    if (!validate()) return;

    try {
      const res = await loginUser({ email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // 🔥 FIX: IMPORTANT FOR NOTIFICATIONS
      localStorage.setItem("email", email);

      window.location.href = "/" + res.data.role.toLowerCase();

    } catch (err) {
      setError("Invalid email or password");
    }
  };

  const googleLogin = () => {
    window.location.href =
      "http://localhost:8081/oauth2/authorization/google";
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">

        <h2>Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />

        {error && (
          <p style={{ color: "red", marginTop: "10px" }}>
            {error}
          </p>
        )}

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

        <hr />

        <button className="google-btn" onClick={googleLogin}>
          Login with Google
        </button>

      </div>
    </div>
  );
}

export default Login;