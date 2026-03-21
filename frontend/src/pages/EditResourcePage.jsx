import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getResourceById, updateResource } from '../services/resourceService'
import '../styles/ResourceFormPage.css'

export default function EditResourcePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: '',
    location: '',
    status: 'ACTIVE'
  })

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
          <p className="form-page-subtitle">Update the selected campus resource.</p>
        </div>

        <Link to="/admin/resources" className="back-link-btn">
          Back to Resources
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="resource-form-card">
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Type</label>
          <input type="text" name="type" value={formData.type} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Capacity</label>
          <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} required />
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