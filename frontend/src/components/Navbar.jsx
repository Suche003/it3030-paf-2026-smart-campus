import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2 className="logo">SmartCampus</h2>
      </div>

      <div className="nav-links">
        <Link to="/">Login</Link>
        <Link to="/register">Register</Link>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;