import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="hero-badge">Smart Campus Resource Management</div>

        <h1>
          Welcome to <span>UniGo</span>
        </h1>

        <p>
          Book university resources, manage requests, track tickets, and keep
          your campus workflow simple, fast, and organized.
        </p>

        <div className="hero-actions">
          <button className="get-started-btn" onClick={() => navigate("/login")}>
            Get Started
          </button>

          <button className="secondary-home-btn" onClick={() => navigate("/register")}>
            Create Account
          </button>
        </div>
      </section>

      <section className="home-cards">
        <div className="home-card">
          <h3>Easy Booking</h3>
          <p>Reserve venues and equipment with a smooth request process.</p>
        </div>

        <div className="home-card">
          <h3>Ticket Support</h3>
          <p>Submit issues and track support tickets in one place.</p>
        </div>

        <div className="home-card">
          <h3>Role Based Access</h3>
          <p>Separate dashboards for admins, students, lecturers, and technicians.</p>
        </div>
      </section>
    </div>
  );
}