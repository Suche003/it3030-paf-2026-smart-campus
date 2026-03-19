import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createResource } from '../services/resourceService'

export default function AddResourcePage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: '',
    location: '',
    status: 'ACTIVE'
  })

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
      await createResource(formData)
      alert('Resource added successfully')
      navigate('/')
    } catch (error) {
      console.error('Error adding resource:', error)
      alert('Failed to add resource')
    }
  }

  return (
    <div>
      <h2>Add Resource</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Name: </label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Type: </label>
          <input type="text" name="type" value={formData.type} onChange={handleChange} required />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Capacity: </label>
          <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Location: </label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} required />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Status: </label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
          </select>
        </div>

        <button type="submit">Save Resource</button>
      </form>
    </div>
  )
}