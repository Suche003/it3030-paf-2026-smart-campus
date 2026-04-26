import { useState } from "react";
import { registerUser } from "../services/authService";
import "./Register.css";

function Register() {

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!user.name) {
      setError("Name is required");
      return false;
    }

    if (!user.email) {
      setError("Email is required");
      return false;
    }

    if (!emailRegex.test(user.email)) {
      setError("Invalid email format");
      return false;
    }

    if (!user.password) {
      setError("Password is required");
      return false;
    }

    if (user.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const res = await registerUser(user);

      alert(res.data.message);
      window.location.href = "/login";

    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    }
  };

  // GOOGLE REGISTER (same as login)
  const googleRegister = () => {
    window.location.href =
      "http://localhost:8081/oauth2/authorization/google";
  };

  return (
    <div className="register-wrapper">
      <div className="register-box">

        <h2>Create Account</h2>

        <input
          placeholder="Name"
          onChange={(e) =>
            setUser({ ...user, name: e.target.value })
          }
        />

        <input
          placeholder="Email"
          onChange={(e) =>
            setUser({ ...user, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setUser({ ...user, password: e.target.value })
          }
        />

        {error && <p>{error}</p>}

        <button onClick={handleSubmit}>
          Register
        </button>

        {/*  GOOGLE BUTTON */}
        <button
          className="google-register-btn"
          onClick={googleRegister}
        >
          Sign up with Google
        </button>

        {/*  LOGIN LINK */}
        <p className="auth-switch">
          Already have an account?{" "}
          <a href="/login">Login</a>
        </p>

      </div>
    </div>
  );
}

export default Register;