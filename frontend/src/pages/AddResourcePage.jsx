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
  const [touched, setTouched] = useState({})

  const availableTypes = getResourceTypesByLabel(formData.label)

  const validateValue = (name, value, currentData = formData) => {
    const prefix = getCodePrefixByLabel(currentData.label)

    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Resource name is required'

      case 'label':
        return value ? '' : 'Faculty / Category is required'

      case 'type':
        return value ? '' : 'Resource type is required'

      case 'codeName':
        if (!value.trim()) return 'Resource code is required'
        if (prefix && !value.startsWith(prefix)) return `Code must start with ${prefix}`
        if (!/^[A-Z]{2}\d{3}$/.test(value)) return 'Code must be like IT001'
        return ''

      case 'capacity':
        return Number(value) > 0 ? '' : 'Capacity must be greater than 0'

      case 'location':
        return value.trim() ? '' : 'Location is required'

      default:
        return ''
    }
  }

  const validateField = (name, value, currentData = formData) => {
    const error = validateValue(name, value, currentData)
    setErrors((prev) => ({ ...prev, [name]: error }))
    return error
  }

  const isFieldValid = (name) => {
    return touched[name] && formData[name] && !errors[name]
  }

  const isFormValid = () => {
    const fields = ['name', 'label', 'type', 'codeName', 'capacity', 'location']

    return fields.every((field) => {
      return formData[field] && !validateValue(field, formData[field])
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let updatedValue = name === 'codeName' ? value.toUpperCase() : value

    setTouched((prev) => ({ ...prev, [name]: true }))

    if (name === 'label') {
      const prefix = getCodePrefixByLabel(updatedValue)

      const updatedData = {
        ...formData,
        label: updatedValue,
        type: '',
        codeName: prefix
      }

      setFormData(updatedData)

      validateField('label', updatedValue, updatedData)
      validateField('type', '', updatedData)
      validateField('codeName', prefix, updatedData)
      return
    }

    const updatedData = {
      ...formData,
      [name]: updatedValue
    }

    setFormData(updatedData)
    validateField(name, updatedValue, updatedData)
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const validateForm = () => {
    const fields = ['name', 'label', 'type', 'codeName', 'capacity', 'location']
    const newErrors = {}
    const newTouched = {}

    fields.forEach((field) => {
      newErrors[field] = validateValue(field, formData[field])
      newTouched[field] = true
    })

    setErrors(newErrors)
    setTouched(newTouched)

    return Object.values(newErrors).every((error) => !error)
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
            Create a new campus resource with category, type and code.
          </p>
        </div>

        <Link to="/admin/resources" className="back-link-btn">
          Back to Resources
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="resource-form-card" noValidate>
        <div className="form-group">
          <label>Resource Name</label>
          <div className="input-wrap">
            <input
              name="name"
              placeholder="Example: Lecture Hall A"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.name ? 'error' : isFieldValid('name') ? 'valid' : ''}
            />
            {isFieldValid('name') && <span className="valid-check">✓</span>}
          </div>
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label>Faculty / Category</label>
          <div className="input-wrap">
            <select
              name="label"
              value={formData.label}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.label ? 'error' : isFieldValid('label') ? 'valid' : ''}
            >
              <option value="">Select category</option>
              {RESOURCE_LABELS.map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
            {isFieldValid('label') && <span className="valid-check">✓</span>}
          </div>
          {errors.label && <p className="field-error">{errors.label}</p>}
        </div>

        <div className="form-group">
          <label>Resource Type</label>
          <div className="input-wrap">
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={!formData.label}
              className={errors.type ? 'error' : isFieldValid('type') ? 'valid' : ''}
            >
              <option value="">
                {formData.label ? 'Select type' : 'Select category first'}
              </option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {isFieldValid('type') && <span className="valid-check">✓</span>}
          </div>
          {errors.type && <p className="field-error">{errors.type}</p>}
        </div>

        <div className="form-group">
          <label>Resource Code</label>
          <div className="input-wrap">
            <input
              name="codeName"
              placeholder="Example: IT001"
              value={formData.codeName}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={5}
              className={errors.codeName ? 'error' : isFieldValid('codeName') ? 'valid' : ''}
            />
            {isFieldValid('codeName') && <span className="valid-check">✓</span>}
          </div>
          {errors.codeName && <p className="field-error">{errors.codeName}</p>}
        </div>

        <div className="form-group">
          <label>Capacity</label>
          <div className="input-wrap">
            <input
              type="number"
              name="capacity"
              placeholder="Example: 100"
              value={formData.capacity}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.capacity ? 'error' : isFieldValid('capacity') ? 'valid' : ''}
            />
            {isFieldValid('capacity') && <span className="valid-check">✓</span>}
          </div>
          {errors.capacity && <p className="field-error">{errors.capacity}</p>}
        </div>

        <div className="form-group">
          <label>Location</label>
          <div className="input-wrap">
            <input
              name="location"
              placeholder="Example: Building A - Floor 2"
              value={formData.location}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.location ? 'error' : isFieldValid('location') ? 'valid' : ''}
            />
            {isFieldValid('location') && <span className="valid-check">✓</span>}
          </div>
          {errors.location && <p className="field-error">{errors.location}</p>}
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
          </select>
        </div>

        <button
          type="submit"
          className={`submit-btn ${!isFormValid() ? 'disabled-btn' : ''}`}
          disabled={!isFormValid()}
        >
          Save Resource
        </button>
      </form>
    </div>
  )
}