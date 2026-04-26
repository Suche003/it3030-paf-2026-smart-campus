import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { createResource, getNextResourceCode } from "../services/resourceService";

import {
  RESOURCE_KINDS,
  getCategoriesByKind,
  getTypesByKindAndCategory,
  isEquipment
} from "../utils/resourceOptions";

import "../styles/ResourceFormPage.css";

export default function AddResourcePage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

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

  const categories = getCategoriesByKind(formData.resourceKind);
  const types = getTypesByKindAndCategory(formData.resourceKind, formData.label);
  const equipment = isEquipment(formData.resourceKind);

  const generateCode = async (label, kind) => {
    try {
      const res = await getNextResourceCode(label, kind);
      return res.data;
    } catch {
      toast.error("Code generation failed");
      return "";
    }
  };

  const handleKindSelect = (kind) => {
    setFormData({
      resourceKind: kind,
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

    setStep(2);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "label") {
      const code = await generateCode(value, formData.resourceKind);

      setFormData({
        ...formData,
        label: value,
        type: "",
        codeName: code,
        capacity: "",
        quantity: "",
        portable: value === "Portable",
        location: ""
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
      await createResource(payload);
      toast.success("Created successfully");
      navigate("/admin/resources");
    } catch (err) {
      toast.error(err.response?.data || "Failed");
    }
  };

  return (
    <div className="form-page-container">
      {step === 1 && (
        <div className="resource-choice-box">
          <h1>What do you want to add?</h1>

          <div className="choice-buttons">
            <button onClick={() => handleKindSelect(RESOURCE_KINDS.VENUE)}>
              🏫 Venue
            </button>

            <button onClick={() => handleKindSelect(RESOURCE_KINDS.EQUIPMENT)}>
              🎥 Equipment
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <>
          <div className="form-page-header">
            <div>
              <h1>Add {equipment ? "Equipment" : "Venue"}</h1>
              <p className="form-page-subtitle">
                {equipment
                  ? "Add portable or fixed equipment to the UniGo catalogue."
                  : "Add a bookable campus venue to the UniGo catalogue."}
              </p>
            </div>

            <Link to="/admin/resources" className="back-link-btn">
              Back
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="resource-form-card">
            <div className="form-group">
              <label>{equipment ? "Equipment Name" : "Venue Name"}</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={equipment ? "Example: Projector" : "Example: Lecture Hall A"}
              />
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
              <input value={formData.codeName} readOnly placeholder="Auto generated" />
              <p className="field-note">Resource code is generated automatically.</p>
            </div>

            {equipment ? (
              <div className="form-group">
                <label>Quantity</label>
                <input
                  name="quantity"
                  value={formData.quantity}
                  inputMode="numeric"
                  onChange={handleChange}
                  placeholder="Example: 10"
                />
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Capacity</label>
                  <input
                    name="capacity"
                    value={formData.capacity}
                    inputMode="numeric"
                    onChange={handleChange}
                    placeholder="Example: 100"
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Example: Building A - Floor 2"
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

            <button className="submit-btn" disabled={!isValid()}>
              Create
            </button>
          </form>
        </>
      )}
    </div>
  );
}