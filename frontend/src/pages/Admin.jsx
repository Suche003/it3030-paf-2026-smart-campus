import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "./Admin.css";

export default function Admin() {
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);

  //  ERROR MESSAGE STATE (NEW)
  const [errorMsg, setErrorMsg] = useState("");

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "LECTURER"
  });

  
  // ROLE CHANGE + EMAIL GENERATION
  
  const updateRole = (role) => {
    setUser((prev) => {
      let domain = "";

      if (role === "LECTURER") domain = "@lecturer.sliit.lk";
      else if (role === "TECHNICIAN") domain = "@technician.lk";
      else domain = "@admin.sliit.lk";

      const username = prev.name
        ? prev.name.split(" ").join("").toLowerCase()
        : "";

      return {
        ...prev,
        role,
        email: username ? username + domain : ""
      };
    });
  };


  // INPUT HANDLER
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => {
      if (name === "name") {
        let domain = "";

        if (prev.role === "LECTURER") domain = "@lecturer.sliit.lk";
        else if (prev.role === "TECHNICIAN") domain = "@technician.lk";
        else domain = "@admin.sliit.lk";

        const username = value.split(" ").join("").toLowerCase();

        return {
          ...prev,
          name: value,
          email: username ? username + domain : ""
        };
      }

      return { ...prev, [name]: value };
    });
  };

 
  // VALIDATION
  
  const validateForm = () => {
    if (!user.name || user.name.length < 3) {
      setErrorMsg("❌ Name must be at least 3 characters");
      return false;
    }

    if (!user.password || user.password.length < 6) {
      setErrorMsg("❌ Password must be at least 6 characters");
      return false;
    }

    if (!user.email) {
      setErrorMsg("❌ Email generation failed");
      return false;
    }

    return true;
  };

  
  // SUBMIT
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:8081/api/auth/admin/create-user",
        {
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      alert("User Created Successfully ✔");

      setUser({
        name: "",
        email: "",
        password: "",
        role: "LECTURER"
      });

      setShowForm(false);

    } catch (err) {
      const response = err.response?.data;

      
      // EMAIL EXISTS HANDLING
      
      if (err.response?.status === 409) {
        setErrorMsg(response?.message || "Email already exists");
      } else {
        setErrorMsg("Error creating user ❌");
      }

      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="admin-dashboard">

      <h1 className="admin-title">Admin Dashboard</h1>

      <div className="admin-cards">

  {/* Resource */}
  <div
    className="admin-card"
    onClick={() => navigate("/admin/resources")}
  >
    <div className="admin-icon">📦</div>
    <h2>Resource Management</h2>
    <p>Manage equipment & venues</p>
  </div>

  {/* User */}
  <div
    className="admin-card"
    onClick={() => setShowForm(true)}
  >
    <div className="admin-icon">👥</div>
    <h2>User Management</h2>
    <p>Create lecturers & technicians</p>
  </div>

  {/* ✅ NEW TICKET CARD */}
  <div
    className="admin-card ticket-card"
    onClick={() => navigate("/admin/tickets")}
  >
    <div className="admin-icon">🎫</div>
    <h2>Ticket Handling</h2>
    <p>Manage support requests & issues</p>
  </div>

</div>

      {/* MODAL */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">

            <h2>Add User</h2>

            {/* ERROR DISPLAY */}
            {errorMsg && (
              <div style={{ color: "red", marginBottom: "10px" }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <input
                type="text"
                name="name"
                placeholder="Name"
                value={user.name}
                onChange={handleChange}
                required
              />

              <input
                type="email"
                name="email"
                value={user.email}
                readOnly
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={user.password}
                onChange={handleChange}
                required
              />

              <select
                name="role"
                value={user.role}
                onChange={(e) => updateRole(e.target.value)}
              >
                <option value="LECTURER">Lecturer</option>
                <option value="TECHNICIAN">Technician</option>
                <option value="ADMIN">Admin</option>
              </select>

              <div className="btn-group">
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}