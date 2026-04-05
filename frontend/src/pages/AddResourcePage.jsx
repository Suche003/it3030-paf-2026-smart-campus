import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createResource } from '../services/resourceService'
import {
  RESOURCE_LABELS,
  getResourceTypesByLabel,
  getCodePrefixByLabel
} from '../utils/resourceOptions'
import '../styles/ResourceFormPage.css'

export default function AddResourcePage() {
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

  // 🔥 REAL-TIME VALIDATION FUNCTION
  const validateField = (name, value) => {
    let error = ''
    const prefix = getCodePrefixByLabel(formData.label)

    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Resource name is required'
        break

      case 'label':
        if (!value) error = 'Faculty / Category is required'
        break

      case 'type':
        if (!value) error = 'Resource type is required'
        break

      case 'codeName':
        if (!value.trim()) {
          error = 'Resource code is required'
        } else if (prefix && !value.startsWith(prefix)) {
          error = `Code must start with ${prefix}`
        } else if (!/^[A-Z]{2}\d{3}$/.test(value)) {
          error = 'Code must be like IT001'
        }
        break

      case 'capacity':
        if (!value || Number(value) <= 0) {
          error = 'Capacity must be greater than 0'
        }
        break

      case 'location':
        if (!value.trim()) error = 'Location is required'
        break

      default:
        break
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error
    }))
  }

  // 🔥 HANDLE CHANGE WITH INSTANT VALIDATION
  const handleChange = (e) => {
    const { name, value } = e.target

    let updatedValue = value

    if (name === 'codeName') {
      updatedValue = value.toUpperCase()
    }

    if (name === 'label') {
      const prefix = getCodePrefixByLabel(value)

      setFormData((prev) => ({
        ...prev,
        label: value,
        type: '',
        codeName: prefix
      }))

      validateField('label', value)
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue
    }))

    validateField(name, updatedValue)
  }

  // FINAL VALIDATION ON SUBMIT
  const validateForm = () => {
    const fields = ['name', 'label', 'type', 'codeName', 'capacity', 'location']
    let valid = true

    fields.forEach((field) => {
      validateField(field, formData[field])
      if (!formData[field]) valid = false
    })

    return valid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await createResource({
        ...formData,
        capacity: Number(formData.capacity)
      })

      alert('Resource added successfully')
      navigate('/admin/resources')
    } catch (error) {
      console.error(error)
      alert('Failed to add resource')
    }
  }

  return (
    <div className="form-page-container">
      <div className="form-page-header">
        <div>
          <h1 className="form-page-title">Add Resource</h1>
          <p className="form-page-subtitle">
            Create a new campus resource with category and type.
          </p>
        </div>

        <Link to="/admin/resources" className="back-link-btn">
          Back to Resources
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="resource-form-card">
        {/* NAME */}
        <div className="form-group">
          <label>Resource Name</label>
          <input
            name="name"
            placeholder="Lecture Hall A"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        {/* CATEGORY */}
        <div className="form-group">
          <label>Faculty / Category</label>
          <select
            name="label"
            value={formData.label}
            onChange={handleChange}
            className={errors.label ? 'error' : ''}
          >
            <option value="">Select category</option>
            {RESOURCE_LABELS.map((label) => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
          {errors.label && <p className="field-error">{errors.label}</p>}
        </div>

        {/* TYPE */}
        <div className="form-group">
          <label>Resource Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            disabled={!formData.label}
            className={errors.type ? 'error' : ''}
          >
            <option value="">
              {formData.label ? 'Select type' : 'Select category first'}
            </option>

            {availableTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.type && <p className="field-error">{errors.type}</p>}
        </div>

        {/* CODE */}
        <div className="form-group">
          <label>Resource Code</label>
          <input
            name="codeName"
            placeholder="IT001"
            value={formData.codeName}
            onChange={handleChange}
            maxLength={5}
            className={errors.codeName ? 'error' : ''}
          />
          {errors.codeName && <p className="field-error">{errors.codeName}</p>}
        </div>

        {/* CAPACITY */}
        <div className="form-group">
          <label>Capacity</label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className={errors.capacity ? 'error' : ''}
          />
          {errors.capacity && <p className="field-error">{errors.capacity}</p>}
        </div>

        {/* LOCATION */}
        <div className="form-group">
          <label>Location</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={errors.location ? 'error' : ''}
          />
          {errors.location && <p className="field-error">{errors.location}</p>}
        </div>

        {/* STATUS */}
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
          </select>
        </div>

        <button className="submit-btn">Save Resource</button>
      </form>
    </div>
  )
}