import { useState, useEffect } from "react";
import { loginUser } from "../services/authService";
import "./Login.css";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔵 GOOGLE LOGIN REDIRECT HANDLER
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role");
    const googleEmail = params.get("email");

    if (token && role) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // ✅ SAFE EMAIL HANDLING
      if (googleEmail) {
        localStorage.setItem("email", googleEmail);
      } else {
        localStorage.removeItem("email"); // 🔥 avoid old email bug
      }

      window.location.replace("/" + role.toLowerCase());
    }
  }, []);

  // 🔐 VALIDATION
  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
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

  // 🔐 NORMAL LOGIN
  const handleLogin = async () => {

    if (!validate()) return;

    try {
      const res = await loginUser({ email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // ✅ IMPORTANT: store correct email
      localStorage.setItem("email", email);

      window.location.replace("/" + res.data.role.toLowerCase());

    } catch (err) {
      setError("Invalid email or password");
    }
  };

  // 🔵 GOOGLE LOGIN
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