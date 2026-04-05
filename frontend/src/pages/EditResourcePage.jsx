import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getResourceById, updateResource } from '../services/resourceService'
import {
  RESOURCE_LABELS,
  getResourceTypesByLabel,
  getCodePrefixByLabel
} from '../utils/resourceOptions'
import '../styles/ResourceFormPage.css'

export default function EditResourcePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: '',
    codeName: '',
    capacity: '',
    location: '',
    status: 'ACTIVE'
  })

  const [errors, setErrors] = useState({})

  const availableTypes = getResourceTypesByLabel(formData.label)

  useEffect(() => {
    loadResource()
  }, [])

  const loadResource = async () => {
    try {
      const response = await getResourceById(id)
      setFormData({
        name: response.data.name || '',
        label: response.data.label || '',
        type: response.data.type || '',
        codeName: response.data.codeName || '',
        capacity: response.data.capacity || '',
        location: response.data.location || '',
        status: response.data.status || 'ACTIVE'
      })
    } catch (error) {
      console.error('Error loading resource:', error)
      alert('Failed to load resource')
    }
  }

  const validateForm = () => {
    const newErrors = {}
    const prefix = getCodePrefixByLabel(formData.label)

    if (!formData.name.trim()) {
      newErrors.name = 'Resource name is required'
    }

    if (!formData.label) {
      newErrors.label = 'Faculty / Category is required'
    }

    if (!formData.type) {
      newErrors.type = 'Resource type is required'
    }

    if (!formData.codeName.trim()) {
      newErrors.codeName = 'Resource code is required'
    } else if (prefix && !formData.codeName.startsWith(prefix)) {
      newErrors.codeName = `Code must start with ${prefix}`
    } else if (!/^[A-Z]{2}\d{3}$/.test(formData.codeName)) {
      newErrors.codeName = 'Code format must be like IT001'
    }

    if (!formData.capacity || Number(formData.capacity) <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setErrors((prev) => ({
      ...prev,
      [name]: ''
    }))

    if (name === 'label') {
      const prefix = getCodePrefixByLabel(value)

      setFormData((prev) => ({
        ...prev,
        label: value,
        type: '',
        codeName: prefix
      }))
      return
    }

    if (name === 'codeName') {
      setFormData((prev) => ({
        ...prev,
        codeName: value.toUpperCase()
      }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? value : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await updateResource(id, {
        ...formData,
        capacity: Number(formData.capacity)
      })

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
            Update resource category, type, code, capacity, location and status.
          </p>
        </div>

        <Link to="/admin/resources" className="back-link-btn">
          Back to Resources
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="resource-form-card" noValidate>
        <div className="form-group">
          <label>Resource Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label>Faculty / Category</label>
          <select
            name="label"
            value={formData.label}
            onChange={handleChange}
          >
            <option value="">Select faculty/category</option>
            {RESOURCE_LABELS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
          {errors.label && <p className="field-error">{errors.label}</p>}
        </div>

        <div className="form-group">
          <label>Resource Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
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
          {errors.type && <p className="field-error">{errors.type}</p>}
        </div>

        <div className="form-group">
          <label>Resource Code</label>
          <input
            type="text"
            name="codeName"
            value={formData.codeName}
            onChange={handleChange}
            maxLength="5"
          />
          {errors.codeName && <p className="field-error">{errors.codeName}</p>}
        </div>

        <div className="form-group">
          <label>Capacity</label>
          <input
            type="number"
            name="capacity"
            min="1"
            value={formData.capacity}
            onChange={handleChange}
          />
          {errors.capacity && <p className="field-error">{errors.capacity}</p>}
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
          {errors.location && <p className="field-error">{errors.location}</p>}
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