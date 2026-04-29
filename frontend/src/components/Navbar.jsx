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

  return (
    <nav className="navbar">
      <div className="nav-left" onClick={() => navigate("/")}>
        <div className="logo-icon">U</div>
        <h2 className="logo">UniGo</h2>
      </div>

      <div className="nav-links">
        {!isLoggedIn && (
          <>
            <Link to="/" className={location.pathname === "/" ? "active-link" : ""}>
              Login
            </Link>
            <Link
              to="/register"
              className={location.pathname === "/register" ? "active-link" : ""}
            >
              Register
            </Link>
          </>
        )}

        {isLoggedIn && (
          <>
            <button onClick={() => navigate("/notifications")} className="nav-btn secondary-btn">
              🔔 Notifications
            </button>

            <button onClick={() => navigate("/profile")} className="nav-btn secondary-btn">
              👤 Profile
            </button>

            <button onClick={logout} className="nav-btn logout-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;