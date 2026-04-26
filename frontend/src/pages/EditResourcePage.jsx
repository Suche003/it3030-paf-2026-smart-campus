import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getResourceById, updateResource } from "../services/resourceService";

import {
  getCategoriesByKind,
  getTypesByKindAndCategory,
  isEquipment,
  getKindLabel
} from "../utils/resourceOptions";

import "../styles/ResourceFormPage.css";

export default function EditResourcePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    resourceKind: "",
    name: "",
    label: "",
    type: "",
    codeName: "",
    capacity: "",
    quantity: "",
    portable: false,
    location: "",
    status: "ACTIVE"
  });

  const equipment = isEquipment(formData.resourceKind);
  const categories = getCategoriesByKind(formData.resourceKind);
  const types = getTypesByKindAndCategory(formData.resourceKind, formData.label);

  useEffect(() => {
    loadResource();
  }, []);

  const loadResource = async () => {
    try {
      const res = await getResourceById(id);

      setFormData({
        resourceKind: res.data.resourceKind || "VENUE",
        name: res.data.name || "",
        label: res.data.label || "",
        type: res.data.type || "",
        codeName: res.data.codeName || "",
        capacity: res.data.capacity?.toString() || "",
        quantity: res.data.quantity?.toString() || "",
        portable: Boolean(res.data.portable),
        location: res.data.location === "N/A" ? "" : res.data.location || "",
        status: res.data.status || "ACTIVE"
      });
    } catch {
      toast.error("Failed to load resource");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "resourceKind" || name === "codeName") return;

    if (name === "label") {
      setFormData({
        ...formData,
        label: value,
        type: "",
        portable: value === "Portable"
      });
      return;
    }

    const val =
      name === "capacity" || name === "quantity"
        ? value.replace(/[^\d]/g, "")
        : value;

    setFormData({ ...formData, [name]: val });
  };

  const isValid = () => {
    if (!formData.name.trim()) return false;
    if (!formData.label) return false;
    if (!formData.type) return false;

    if (equipment) {
      return formData.quantity && parseInt(formData.quantity) > 0;
    }

    if (!formData.location.trim()) return false;
    return formData.capacity && parseInt(formData.capacity) > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid()) {
      toast.error("Fill all required fields");
      return;
    }

    const payload = {
      ...formData,
      capacity: equipment ? null : parseInt(formData.capacity),
      quantity: equipment ? parseInt(formData.quantity) : null,
      portable: equipment ? formData.label === "Portable" : false,
      location: equipment ? "N/A" : formData.location
    };

    try {
      await updateResource(id, payload);
      toast.success("Updated successfully");
      navigate("/admin/resources");
    } catch (err) {
      toast.error(err.response?.data || "Update failed");
    }
  };

  return (
    <div className="form-page-container">
      <div className="form-page-header">
        <div>
          <h1>Edit {getKindLabel(formData.resourceKind)}</h1>
          <p className="form-page-subtitle">
            Update resource details. Resource kind and code are locked.
          </p>
        </div>

        <Link to="/admin/resources" className="back-link-btn">
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="resource-form-card">
        <div className="form-group">
          <label>Resource Kind</label>
          <input value={getKindLabel(formData.resourceKind)} readOnly />
          <p className="field-note">Resource kind is locked after creation.</p>
        </div>

        <div className="form-group">
          <label>{equipment ? "Equipment Name" : "Venue Name"}</label>
          <input name="name" value={formData.name} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select name="label" value={formData.label} onChange={handleChange}>
            <option value="">Select</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Type</label>
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="">Select</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Code</label>
          <input value={formData.codeName} readOnly />
          <p className="field-note">Resource code is permanent.</p>
        </div>

        {equipment ? (
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="text"
              inputMode="numeric"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
            />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label>Capacity</label>
              <input
                type="text"
                inputMode="numeric"
                name="capacity"
                value={formData.capacity}
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
          </>
        )}

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="ACTIVE">AVAILABLE</option>
            <option value="OUT_OF_SERVICE">UNAVAILABLE</option>
          </select>
        </div>

        <button disabled={!isValid()} className="submit-btn">
          Update
        </button>
      </form>
    </div>
  );
}