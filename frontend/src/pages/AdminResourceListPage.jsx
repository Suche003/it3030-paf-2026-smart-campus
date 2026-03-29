import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getAllResources,
  deleteResource,
  searchResources,
  filterResourcesByLabel,
  filterResourcesByType
} from '../services/resourceService'
import {
  RESOURCE_LABELS,
  FACULTY_TYPES,
  COMMON_TYPES
} from '../utils/resourceOptions'
import '../styles/AdminResourceListPage.css'

export default function AdminResourceListPage() {
  const [resources, setResources] = useState([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterField, setFilterField] = useState('all')
  const [filterValue, setFilterValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const allTypes = [...FACULTY_TYPES, ...COMMON_TYPES]

  const loadResources = async () => {
    setLoading(true)
    setError('')
    setSearchKeyword('')
    setFilterField('all')
    setFilterValue('')

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
    if (!searchKeyword.trim()) {
      loadResources()
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await searchResources(searchKeyword)
      setResources(response.data)
    } catch (error) {
      console.error('Error searching resources:', error)
      setError('Failed to search resources')
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = async () => {
    if (filterField === 'all' || !filterValue) {
      loadResources()
      return
    }

    setLoading(true)
    setError('')

    try {
      let response

      if (filterField === 'label') {
        response = await filterResourcesByLabel(filterValue)
      } else if (filterField === 'type') {
        response = await filterResourcesByType(filterValue)
      }

      setResources(response.data)
    } catch (error) {
      console.error('Error filtering resources:', error)
      setError('Failed to filter resources')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterFieldChange = (e) => {
    setFilterField(e.target.value)
    setFilterValue('')
  }

  if (loading) {
    return (
      <div className="page-container">
        <p className="info-text">Loading resources...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <p className="error-text">{error}</p>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Facilities & Assets Catalogue</p>
          <h1 className="page-title">Admin Resource Management</h1>
          <p className="page-subtitle">
            Categorize, search, filter and manage all campus resources from one premium admin panel.
          </p>
        </div>

        <Link to="/admin/resources/add" className="primary-link-btn">
          Add Resource
        </Link>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by name, code, type or faculty"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="search-input"
        />

        <button onClick={handleSearch} className="search-btn">
          Search
        </button>

        <select
          value={filterField}
          onChange={handleFilterFieldChange}
          className="filter-select"
        >
          <option value="all">Filter By</option>
          <option value="label">Faculty / Category</option>
          <option value="type">Resource Type</option>
        </select>

        {filterField === 'label' && (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="filter-select"
          >
            <option value="">Select category</option>
            {RESOURCE_LABELS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        )}

        {filterField === 'type' && (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="filter-select"
          >
            <option value="">Select type</option>
            {allTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        )}

        <button onClick={handleFilter} className="filter-btn">
          Apply
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
                <th>Code</th>
                <th>Name</th>
                <th>Faculty / Category</th>
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
                  <td>{resource.codeName}</td>
                  <td>{resource.name}</td>
                  <td>{resource.label}</td>
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