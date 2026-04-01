import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createResource } from '../services/resourceService'
import {
  RESOURCE_LABELS,
  getResourceTypesByLabel
} from '../utils/resourceOptions'
import '../styles/ResourceFormPage.css'

export default function AddResourcePage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    codeName: '',
    label: '',
    type: '',
    capacity: '',
    location: '',
    status: 'ACTIVE'
  })

  const availableTypes = getResourceTypesByLabel(formData.label)

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'label') {
      setFormData((prev) => ({
        ...prev,
        label: value,
        type: ''
      }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await createResource(formData)
      alert('Resource added successfully')
      navigate('/admin/resources')
    } catch (error) {
      console.error('Error adding resource:', error)
      alert('Failed to add resource')
    }
  }

  return (
    <div className="form-page-container">
      <div className="form-page-header">
        <div>
          <h1 className="form-page-title">Add Resource</h1>
          <p className="form-page-subtitle">
            Create a new campus resource with faculty/category and type.
          </p>
        </div>

        <Link to="/admin/resources" className="back-link-btn">
          Back to Resources
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="resource-form-card">
        <div className="form-group">
          <label>Resource Name</label>
          <input
            type="text"
            name="name"
            placeholder="Example: Lecture Hall A"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Resource Code</label>
          <input
            type="text"
            name="codeName"
            placeholder="Example: IT001 / CO001"
            value={formData.codeName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Faculty / Category</label>
          <select
            name="label"
            value={formData.label}
            onChange={handleChange}
            required
          >
            <option value="">Select faculty/category</option>
            {RESOURCE_LABELS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Resource Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            disabled={!formData.label}
          >
            <option value="">
              {formData.label ? 'Select resource type' : 'Select category first'}
            </option>

            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Capacity</label>
          <input
            type="number"
            name="capacity"
            min="1"
            placeholder="Example: 100"
            value={formData.capacity}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            placeholder="Example: Building A - Floor 2"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
          </select>
        </div>

        <button type="submit" className="submit-btn save-btn">
          Save Resource
        </button>
      </form>
    </div>
  )
}