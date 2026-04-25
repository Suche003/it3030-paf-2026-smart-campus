import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
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

  useEffect(() => {
    loadResource()
  }, [])

  const loadResource = async () => {
    try {
      const res = await getResourceById(id)

      setFormData({
        name: res.data.name || '',
        label: res.data.label || '',
        type: res.data.type || '',
        codeName: res.data.codeName || '',
        capacity: res.data.capacity?.toString() || '',
        location: res.data.location || '',
        status: res.data.status || 'ACTIVE'
      })
    } catch {
      toast.error('Failed to load resource')
    }
  }

  const validateValue = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Required'

      case 'type':
        return value ? '' : 'Required'

      case 'capacity':
        if (!value) return 'Required'
        if (!/^\d+$/.test(value)) return 'Numbers only'
        if (parseInt(value) <= 0) return 'Must be > 0'
        return ''

      case 'location':
        return value.trim() ? '' : 'Required'

      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'codeName' || name === 'label') return

    const updatedValue =
      name === 'capacity'
        ? value.replace(/[^\d]/g, '')
        : value

    const updatedData = { ...formData, [name]: updatedValue }

    setFormData(updatedData)
    setTouched({ ...touched, [name]: true })

    setErrors({
      ...errors,
      [name]: validateValue(name, updatedValue)
    })
  }

  const isFormValid = () =>
    ['name', 'type', 'capacity', 'location'].every(
      (f) => formData[f] && !validateValue(f, formData[f])
    )

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isFormValid()) return

    try {
      await updateResource(id, {
        ...formData,
        capacity: parseInt(formData.capacity)
      })

      toast.success('Updated successfully')
      navigate('/admin/resources')
    } catch {
      toast.error('Update failed')
    }
  }

  return (
    <div className="form-page-container">
      <div className="form-page-header">
        <h1>Edit Resource</h1>
        <Link to="/admin/resources" className="back-link-btn">Back</Link>
      </div>

      <form onSubmit={handleSubmit} className="resource-form-card">

        <div className="form-group">
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Faculty</label>
          <select value={formData.label} disabled>
            {RESOURCE_LABELS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Type</label>
          <select name="type" value={formData.type} onChange={handleChange}>
            {availableTypes.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Code</label>
          <input value={formData.codeName} readOnly />
        </div>

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
          <input name="location" value={formData.location} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="ACTIVE">AVAILABLE</option>
            <option value="OUT_OF_SERVICE">UNAVAILABLE</option>
          </select>
        </div>

        <button disabled={!isFormValid()} className="submit-btn">
          Update Resource
        </button>
      </form>
    </div>
  )
}