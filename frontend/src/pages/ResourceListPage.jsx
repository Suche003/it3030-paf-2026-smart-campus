import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getAllResources,
  deleteResource,
  searchResourcesByType
} from '../services/resourceService'

export default function ResourceListPage() {
  const [resources, setResources] = useState([])
  const [searchType, setSearchType] = useState('')

  const loadResources = async () => {
    try {
      const response = await getAllResources()
      setResources(response.data)
    } catch (error) {
      console.error('Error loading resources:', error)
    }
  }

  useEffect(() => {
    loadResources()
  }, [])

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this resource?')
    if (!confirmed) return

    try {
      await deleteResource(id)
      loadResources()
    } catch (error) {
      console.error('Error deleting resource:', error)
    }
  }

  const handleSearch = async () => {
    try {
      if (!searchType.trim()) {
        loadResources()
        return
      }

      const response = await searchResourcesByType(searchType)
      setResources(response.data)
    } catch (error) {
      console.error('Error searching resources:', error)
    }
  }

  return (
    <div>
      <h2>All Resources</h2>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by type"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={loadResources} style={{ marginLeft: '10px' }}>Reset</button>
      </div>

      {resources.length === 0 ? (
        <p>No resources found.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id}>
                <td>{resource.id}</td>
                <td>{resource.name}</td>
                <td>{resource.type}</td>
                <td>{resource.capacity}</td>
                <td>{resource.location}</td>
                <td>{resource.status}</td>
                <td>
                  <Link to={`/edit/${resource.id}`}>
                    <button style={{ marginRight: '10px' }}>Edit</button>
                  </Link>
                  <button onClick={() => handleDelete(resource.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}