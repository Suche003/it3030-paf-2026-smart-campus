import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getTickets,
  updateTicket
} from "../services/ticketService";

export default function EditTicketPage() {
  const { id } = useParams();
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
    status: ""
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTicket();
  }, []);

  const loadTicket = async () => {
    try {
      const res = await getTickets();

      const ticket = res.data.find(
        (t) => t.id === parseInt(id)
      );

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
    } catch (error) {
      console.error(error);
      toast.error("Failed to load ticket");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateTicket(id, formData);
      toast.success("Updated successfully");
      navigate("/student/tickets");
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="form-page-container">
      <div className="form-page-header">
        <h1>Edit Ticket</h1>
        <Link to="/student/tickets">Back</Link>
      </div>

      <form onSubmit={handleSubmit} className="resource-form-card">

        <div className="form-group">
          <label>Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Preferred Contact</label>
          <input
            name="contact"
            value={formData.contact}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Resource Name</label>
          <input
            name="resourceName"
            value={formData.resourceName}
            onChange={handleChange}
          />
        </div>

        <button className="submit-btn">
          Update Ticket
        </button>
      </form>
    </div>
  );
}