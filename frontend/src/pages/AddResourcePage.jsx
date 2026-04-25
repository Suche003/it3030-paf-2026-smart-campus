import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
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
    label: '',
    type: '',
    codeName: '',
    capacity: '',
    location: '',
    status: 'ACTIVE'
  })

  const availableTypes = getResourceTypesByLabel(formData.label)

  const handleChange = (e) => {
    const { name, value } = e.target

    const updatedValue =
      name === 'capacity'
        ? value.replace(/[^\d]/g, '')
        : value

    setFormData({ ...formData, [name]: updatedValue })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await createResource({
        ...formData,
        capacity: parseInt(formData.capacity)
      })

      toast.success('Created successfully')
      navigate('/admin/resources')
    } catch {
      toast.error('Creation failed')
    }
  }

  return (
    <div className="form-page-container">
      <div className="form-page-header">
        <h1>Add Resource</h1>
        <Link to="/admin/resources" className="back-link-btn">Back</Link>
      </div>

      <form onSubmit={handleSubmit} className="resource-form-card">

        <div className="form-group">
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Faculty</label>
          <select name="label" value={formData.label} onChange={handleChange}>
            <option value="">Select</option>
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
          <input name="codeName" value={formData.codeName} onChange={handleChange} />
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

        <button className="submit-btn">Add Resource</button>
      </form>
    </div>
  )
}