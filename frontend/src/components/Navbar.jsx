import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar() {

  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkAuth = () => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  };

  useEffect(() => {
    checkAuth();
  }, [location]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/");
  };

  const goNotifications = () => {
    navigate("/notifications");
  };

  const goProfile = () => {
    navigate("/profile");
  };

  return (
    <nav className="navbar">

      <div className="nav-left">
        <h2 className="logo">SmartCampus</h2>
      </div>

      <div className="nav-links">

        {/* 🔓 NOT LOGGED IN */}
        {!isLoggedIn && (
          <>
            <Link to="/">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {/* 🔐 LOGGED IN */}
        {isLoggedIn && (
          <>
            {/* 🔔 Notifications */}
            <button onClick={goNotifications} className="notif-btn">
              🔔 Notifications
            </button>

            {/* 👤 PROFILE BUTTON (NEW) */}
            <button onClick={goProfile} className="profile-btn">
              👤 Profile
            </button>

            {/* 🚪 LOGOUT */}
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;