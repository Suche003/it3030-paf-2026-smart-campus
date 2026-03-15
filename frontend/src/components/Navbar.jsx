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
    setIsLoggedIn(false);
    navigate("/");
  };

  const goNotifications = () => {
    navigate("/notifications");
  };

  return (
    <nav className="navbar">

      <div className="nav-left">
        <h2 className="logo">SmartCampus</h2>
      </div>

      <div className="nav-links">

        {!isLoggedIn && (
          <>
            <Link to="/">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {isLoggedIn && (
          <>
            <button onClick={goNotifications} className="notif-btn">
              🔔 Notifications
            </button>

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