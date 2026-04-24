import { useState } from "react";
import { registerUser } from "../services/authService";
import "./Register.css";

function Register() {

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: ""
  });

  // ✅ NEW: error state
  const [error, setError] = useState("");

  // ✅ NEW: validation function
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

    // ✅ NEW: stop if invalid
    if (!validate()) return;

    await registerUser(user);

    alert("Registered Successfully!");
    window.location.href = "/login";
  };

  return (
    <div className="register-wrapper">
      <div className="register-box">

        <h2>Create Account</h2>

        <input
          placeholder="Name"
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />

        <input
          placeholder="Email"
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setUser({ ...user, password: e.target.value })}
        />

        {/* ✅ NEW: error display */}
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

        <button onClick={handleSubmit}>
          Register
        </button>

      </div>
    </div>
  );
}

export default Register;