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

  // 🔥 Generate Code
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
      ...formData,
      resourceKind: kind
    });
    setStep(2);
  };

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "label") {
      const code = await generateCode(value, formData.resourceKind);

      setFormData({
        ...formData,
        label: value,
        type: "",
        codeName: code
      });
      return;
    }

    const val =
      name === "capacity" || name === "quantity"
        ? value.replace(/[^\d]/g, "")
        : type === "checkbox"
        ? checked
        : value;

    setFormData({ ...formData, [name]: val });
  };

  const isValid = () => {
    if (!formData.name) return false;
    if (!formData.label) return false;
    if (!formData.type) return false;
    if (!formData.location) return false;

    if (equipment) {
      return formData.quantity && parseInt(formData.quantity) > 0;
    }

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
      quantity: equipment ? parseInt(formData.quantity) : null
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

      {/* 🔥 STEP 1 */}
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

      {/* 🔥 STEP 2 */}
      {step === 2 && (
        <>
          <div className="form-page-header">
            <h1>
              Add {equipment ? "Equipment" : "Venue"}
            </h1>

            <Link to="/admin/resources" className="back-link-btn">
              Back
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="resource-form-card">

            <div className="form-group">
              <label>Name</label>
              <input name="name" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select name="label" onChange={handleChange}>
                <option value="">Select</option>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Type</label>
              <select name="type" onChange={handleChange}>
                <option value="">Select</option>
                {types.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Code</label>
              <input value={formData.codeName} readOnly />
            </div>

            {/* 🔥 Equipment vs Venue */}
            {equipment ? (
              <>
                <div className="form-group">
                  <label>Quantity</label>
                  <input name="quantity" onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="portable"
                      onChange={handleChange}
                    />
                    Portable
                  </label>
                </div>
              </>
            ) : (
              <div className="form-group">
                <label>Capacity</label>
                <input name="capacity" onChange={handleChange} />
              </div>
            )}

            <div className="form-group">
              <label>Location</label>
              <input name="location" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" onChange={handleChange}>
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