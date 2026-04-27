import { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

function Profile() {

  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // LOAD PROFILE
  
  useEffect(() => {
    if (email) {
      loadProfile();
    } else {
      setError("No user email found. Please login again.");
      setLoading(false);
    }
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:8081/api/profile/${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUser(res.data);
      setError("");

    } catch (err) {
      setError("Failed to load profile");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // HANDLE INPUT CHANGE
 
  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  // UPDATE PROFILE
  
  const updateProfile = async () => {
    try {

      await axios.put(
        `http://localhost:8081/api/profile/${email}`,
        user,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Profile Updated Successfully!");

    } catch (err) {
      console.log(err);
      alert("Update failed");
    }
  };

  
  // DELETE PROFILE
  
  const deleteProfile = async () => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account?"
    );

    if (!confirmDelete) return;

    try {

      await axios.delete(
        `http://localhost:8081/api/profile/${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      localStorage.clear();
      window.location.href = "/login";

    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  
  // UI
  
  if (loading) {
    return <h3 style={{ padding: "20px" }}>Loading profile...</h3>;
  }

  return (
    <div className="profile-container">

      <div className="profile-card">

        <h2>My Profile</h2>

        {error && <p className="error">{error}</p>}

        <label>Name</label>
        <input
          name="name"
          value={user.name || ""}
          onChange={handleChange}
        />

        <label>Email</label>
        <input
          name="email"
          value={user.email || ""}
          disabled
        />

        <label>New Password</label>
        <input
          name="password"
          type="password"
          placeholder="Enter new password"
          onChange={handleChange}
        />

        <div className="btn-group">

          <button className="update-btn" onClick={updateProfile}>
            Update
          </button>

          <button className="delete-btn" onClick={deleteProfile}>
            Delete Account
          </button>

        </div>

      </div>

    </div>
  );
}

export default Profile;