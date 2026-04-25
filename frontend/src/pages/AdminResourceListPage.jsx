import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getAllResources,
  deleteResource,
  searchResourcesByType
} from '../services/resourceService'
import '../styles/AdminResourceListPage.css'

export default function AdminResourceListPage() {
  const [resources, setResources] = useState([])
  const [searchType, setSearchType] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadResources = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getAllResources()
      setResources(response.data)
    } catch (error) {
      console.error('Error loading resources:', error)
      setError('Failed to load resources')
    } finally {
      setLoading(false)
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
      alert('Failed to delete resource')
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
      setError('Failed to search resources')
    }
  }

  if (loading) {
    return <div className="page-container"><p className="info-text">Loading...</p></div>
  }

  if (error) {
    return <div className="page-container"><p className="error-text">{error}</p></div>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Resource Management</h1>
          <p className="page-subtitle">
            Manage all campus resources from the admin panel.
          </p>
        </div>

        <Link to="/admin/resources/add" className="primary-link-btn">
          Add Resource
        </Link>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by type"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="search-input"
        />

        <button onClick={handleSearch} className="search-btn">
          Search
        </button>

        <button onClick={loadResources} className="reset-btn">
          Reset
        </button>
      </div>

      {resources.length === 0 ? (
        <p className="info-text">No resources found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="resource-table">
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
                  <td>
                    <span
                      className={
                        resource.status === 'ACTIVE'
                          ? 'status-badge active'
                          : 'status-badge inactive'
                      }
                    >
                      {resource.status}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/admin/resources/edit/${resource.id}`}
                      className="table-btn edit-btn"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="table-btn delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}