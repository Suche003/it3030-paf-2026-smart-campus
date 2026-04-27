import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getTickets, updateTicket } from "../services/ticketService";
import { getAllResources } from "../services/resourceService";

export default function EditTicketPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    contact: "",
    resourceName: "",
    resourceId: "",
    priority: "MEDIUM",
    status: ""
  });

  const [errors, setErrors] = useState({});
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load resources
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

  // Load ticket
  useEffect(() => {
    loadTicket();
  }, []);

  const loadTicket = async () => {
    try {
      const res = await getTickets();
      const ticket = res.data.find((t) => t.id === parseInt(id));

      if (!ticket) {
        toast.error("Ticket not found");
        navigate("/student/tickets");
        return;
      }

      if (ticket.status === "CLOSED") {
        toast.error("Cannot edit CLOSED ticket");
        navigate("/student/tickets");
        return;
      }

      setFormData(ticket);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load ticket");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "resourceName") {
      const selected = resources.find((r) => r.name === value);
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

    if (!formData.title?.trim()) newErrors.title = "Title required";
    if (!formData.category?.trim()) newErrors.category = "Category required";
    if (!formData.resourceName) newErrors.resourceName = "Resource required";
    if (!formData.location) newErrors.location = "Location required";
    if (!formData.contact?.trim()) newErrors.contact = "Contact required";
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
      await updateTicket(id, formData);
      toast.success("Ticket updated successfully");
      navigate("/student/tickets");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="form-page-container">
      <header className="form-page-header">
        <div>
          <h1 className="form-page-title text-white">Edit Ticket</h1>
          <p className="form-page-subtitle">
            Update your support request details.
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
          Update Ticket
        </button>
      </form>
    </div>
  );
}