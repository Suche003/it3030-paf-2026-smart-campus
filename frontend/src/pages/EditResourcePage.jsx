import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getResourceById, updateResource } from '../services/resourceService'
import {
  RESOURCE_LABELS,
  getResourceTypesByLabel
} from '../utils/resourceOptions'
import '../styles/ResourceFormPage.css'

export default function EditResourcePage() {
  const { id } = useParams()
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

  useEffect(() => {
    loadResource()
  }, [])

  const loadResource = async () => {
    try {
      const response = await getResourceById(id)
      setFormData(response.data)
    } catch (error) {
      console.error('Error loading resource:', error)
      alert('Failed to load resource')
    }
  }

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
      await updateResource(id, formData)
      alert('Resource updated successfully')
      navigate('/admin/resources')
    } catch (error) {
      console.error('Error updating resource:', error)
      alert('Failed to update resource')
    }
  }

  return (
    <div className="form-page-container">
      <div className="form-page-header">
        <div>
          <h1 className="form-page-title">Edit Resource</h1>
          <p className="form-page-subtitle">
            Update resource category, type, capacity, location and status.
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

        <button type="submit" className="submit-btn update-btn">
          Update Resource
        </button>
      </form>
    </div>
  )
}