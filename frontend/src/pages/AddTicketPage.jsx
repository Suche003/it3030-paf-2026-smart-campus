import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { createTicket } from "../services/ticketService";
import { getAllResources } from "../services/resourceService";

export default function AddTicketPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    contact: "",
    resourceName: "",
    resourceId: "",
    priority: "MEDIUM",
    studentId: 1
  });

  const [errors, setErrors] = useState({});
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await getAllResources();
        setResources(res.data || []);
      } catch (err) {
        toast.error("Failed to load resources");
      }
    };
    fetchResources();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "resourceName") {
      const selected = resources.find(r => r.name === value);
      setFormData({
        ...formData,
        resourceName: value,
        resourceId: selected ? selected.id : "",
        location: selected ? selected.location : ""
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const getFieldClass = (name) =>
    errors[name] ? "error" : formData[name] ? "valid" : "";

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title required";
    if (!formData.category.trim()) newErrors.category = "Category required";
    if (!formData.resourceName) newErrors.resourceName = "Resource required";
    if (!formData.location) newErrors.location = "Location required";
    if (!formData.contact.trim()) newErrors.contact = "Contact required";
    if (!formData.priority) newErrors.priority = "Priority required";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await createTicket(formData);
      toast.success("Ticket created successfully");
      navigate("/student/tickets");
    } catch (err) {
      toast.error("Failed to create ticket");
    }
  };

  return (
    <div className="form-page-container">
      <header className="form-page-header">
        <div>
          <h1 className="form-page-title text-white">Create Ticket</h1>
          <p className="form-page-subtitle">
            Standardized request for campus resource support.
          </p>
        </div>
        <Link to="/student/tickets" className="back-link-btn">
          <span>&larr; Back to List</span>
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="resource-form-card">

        <div className="form-group">
          <label>Issue Title</label>
          <div className="input-wrap">
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={getFieldClass("title")}
              placeholder="Brief summary of the issue"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Category</label>
          <div className="input-wrap">
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={getFieldClass("category")}
              placeholder="Hardware, Software..."
            />
          </div>
        </div>

        <div className="form-group">
          <label>Resource Name</label>
          <div className="input-wrap">
            <select
              name="resourceName"
              value={formData.resourceName}
              onChange={handleChange}
              className={getFieldClass("resourceName")}
            >
              <option value="">Select Resource</option>
              {resources.map((r) => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Location</label>
          <div className="input-wrap">
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={getFieldClass("location")}
            >
              <option value="">Select Location</option>
              {[...new Set(resources.map(r => r.location))].map((loc, idx) => (
                <option key={idx} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Priority</label>
          <div className="input-wrap">
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={getFieldClass("priority")}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Contact Info</label>
          <div className="input-wrap">
            <input
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className={getFieldClass("contact")}
              placeholder="Email or Phone Number"
            />
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Create Ticket
        </button>
      </form>
    </div>
  );
}