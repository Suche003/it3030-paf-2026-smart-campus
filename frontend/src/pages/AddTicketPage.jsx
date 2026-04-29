import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { createTicketWithImages } from "../services/ticketService";
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
    studentId: Number(localStorage.getItem("userId")) || 1,
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [resources, setResources] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await getAllResources();
        setResources(res.data || []);
      } catch {
        toast.error("Failed to load resources");
      }
    };

    fetchResources();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "resourceName") {
      const selected = resources.find((r) => r.name === value);

      setFormData({
        ...formData,
        resourceName: value,
        resourceId: selected ? selected.id : "",
        location: selected ? selected.location : "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleImages = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length > 3) {
      toast.error("You can upload only 3 images");
      e.target.value = "";
      return;
    }

    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Only image files are allowed");
      e.target.value = "";
      return;
    }

    setImages(validFiles);
    setPreviews(validFiles.map((file) => URL.createObjectURL(file)));
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

    if (isSubmitting) return;

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = new FormData();

      data.append("title", formData.title);
      data.append("category", formData.category);
      data.append("location", formData.location);
      data.append("contact", formData.contact);
      data.append("resourceName", formData.resourceName);
      data.append("resourceId", formData.resourceId);
      data.append("priority", formData.priority);
      data.append("studentId", Number(localStorage.getItem("userId")) || 1);

      if (images[0]) data.append("image1", images[0]);
      if (images[1]) data.append("image2", images[1]);
      if (images[2]) data.append("image3", images[2]);

      await createTicketWithImages(data);

      toast.success("Ticket created successfully");
      navigate("/student/tickets");
    } catch (err) {
      toast.error(err.response?.data || "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-page-container">
      <header className="form-page-header">
        <div>
          <h1 className="form-page-title text-white">Create Ticket</h1>
          <p className="form-page-subtitle">
            Add issue details and upload up to 3 supporting images.
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
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
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
              {[...new Set(resources.map((r) => r.location).filter(Boolean))].map(
                (loc, idx) => (
                  <option key={idx} value={loc}>
                    {loc}
                  </option>
                )
              )}
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
              <option value="CRITICAL">CRITICAL</option>
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
              placeholder="Email or phone number"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Upload Images Maximum 3</label>
          <div className="input-wrap">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImages}
            />
          </div>

          {previews.length > 0 && (
            <div style={{ display: "flex", gap: "12px", marginTop: "14px" }}>
              {previews.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`preview-${index}`}
                  style={{
                    width: "120px",
                    height: "90px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Ticket"}
        </button>
      </form>
    </div>
  );
}