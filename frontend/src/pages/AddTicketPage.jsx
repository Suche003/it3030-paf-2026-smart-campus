import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { createTicket } from "../services/ticketService";

export default function AddTicketPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    contact: "",
    resourceName: "",
    resourceId: "",
    priority: "MEDIUM",
    studentId: 1 // temporary
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createTicket({
        ...formData,
        resourceId: parseInt(formData.resourceId)
      });

      toast.success("Ticket created successfully");
      navigate("/student/tickets");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create ticket");
    }
  };

  return (
    <div className="form-page-container">
      <div className="form-page-header">
        <h1>Create Ticket</h1>
        <Link to="/student/tickets">Back</Link>
      </div>

      <form onSubmit={handleSubmit} className="resource-form-card">

        <div className="form-group">
          <label>Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Preferred Contact</label>
          <input
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Resource Name</label>
          <input
            name="resourceName"
            value={formData.resourceName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Resource ID</label>
          <input
            name="resourceId"
            value={formData.resourceId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>

        <button className="submit-btn">
          Create Ticket
        </button>
      </form>
    </div>
  );
}