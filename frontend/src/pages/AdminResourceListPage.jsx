import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import {
  getAllResources,
  deleteResource,
  searchResources
} from '../services/resourceService'

import {
  RESOURCE_LABELS,
  FACULTY_RESOURCE_TYPES,
  COMMON_RESOURCE_TYPES
} from '../utils/resourceOptions'

import ConfirmModal from '../components/ConfirmModal'
import '../styles/AdminResourceListPage.css'

export default function AdminResourceListPage() {
  const [resources, setResources] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterValue, setFilterValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 🔥 modal states
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const allTypes = [...FACULTY_RESOURCE_TYPES, ...COMMON_RESOURCE_TYPES]

  // LOAD DATA
  const loadResources = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getAllResources()
      setResources(response.data)
    } catch (error) {
      console.error(error)
      setError('Failed to load resources')
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResources()
  }, [])

  // 🔥 MODAL CONTROL
  const openDeleteModal = (resource) => {
    setDeleteTarget(resource)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteTarget(null)
    setDeleteModalOpen(false)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      await deleteResource(deleteTarget.id)
      toast.success('Resource deleted successfully')
      closeDeleteModal()
      loadResources()
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete resource')
    }
  }

  // SEARCH
  const handleSearch = async () => {
    try {
      if (!searchTerm.trim()) {
        loadResources()
        return
      }

      const response = await searchResources(searchTerm)
      setResources(response.data)
    } catch (error) {
      console.error(error)
      setError('Search failed')
      toast.error('Search failed')
    }
  }

  // FILTER
  const handleFilter = async () => {
    try {
      if (!filterType || !filterValue) {
        loadResources()
        return
      }

      const response = await searchResources(filterValue)
      setResources(response.data)
    } catch (error) {
      console.error(error)
      setError('Filter failed')
      toast.error('Filter failed')
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <p className="info-text">Loading...</p>
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

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Resource Management</h1>
          <p className="page-subtitle">
            Categorize, search, filter and manage all campus resources.
          </p>
        </div>

        <Link to="/admin/resources/add" className="primary-link-btn">
          Add Resource
        </Link>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by name, code, type or faculty"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <button onClick={handleSearch} className="search-btn">
          Search
        </button>

        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value)
            setFilterValue('')
          }}
          className="filter-select"
        >
          <option value="">Filter By</option>
          <option value="label">Faculty / Category</option>
          <option value="type">Resource Type</option>
        </select>

        <select
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="filter-select"
          disabled={!filterType}
        >
          <option value="">Select</option>

          {filterType === 'label' &&
            RESOURCE_LABELS.map((label) => (
              <option key={label} value={label}>{label}</option>
            ))}

          {filterType === 'type' &&
            allTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
        </select>

        <button onClick={handleFilter} className="apply-btn">
          Apply
        </button>

        <button onClick={loadResources} className="reset-btn">
          Reset
        </button>
      </div>

      {/* TABLE */}
      {resources.length === 0 ? (
        <p className="info-text">No resources found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="resource-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Faculty</th>
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
                  <td>{resource.codeName}</td>
                  <td>{resource.name}</td>
                  <td>{resource.label}</td>
                  <td>{resource.type}</td>
                  <td>{resource.capacity}</td>
                  <td>{resource.location}</td>

                  <td>
                    <span className="status-badge active">
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
                      onClick={() => openDeleteModal(resource)}
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

      {/* 🔥 CONFIRM MODAL */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Resource?"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.name} (${deleteTarget.codeName})? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  )
}