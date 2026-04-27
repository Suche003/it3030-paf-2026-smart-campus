import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import {
  getAllResources,
  deleteResource,
  searchResources,
  toggleResourceStatus
} from '../services/resourceService'

import {
  VENUE_CATEGORIES,
  EQUIPMENT_CATEGORIES,
  FACULTY_VENUE_TYPES,
  COMMON_VENUE_TYPES,
  EQUIPMENT_TYPES,
  getKindLabel,
  isEquipment
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

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const allCategories = [...VENUE_CATEGORIES, ...EQUIPMENT_CATEGORIES]
  const allTypes = [...FACULTY_VENUE_TYPES, ...COMMON_VENUE_TYPES, ...EQUIPMENT_TYPES]

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

  const handleToggleStatus = async (resource) => {
    try {
      await toggleResourceStatus(resource.id)
      toast.success(resource.status === 'ACTIVE' ? 'Marked as Unavailable' : 'Marked as Active')
      loadResources()
    } catch (error) {
      console.error(error)
      toast.error('Failed to update status')
    }
  }

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

  const resetFilters = () => {
    setSearchTerm('')
    setFilterType('')
    setFilterValue('')
    loadResources()
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
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Resource Management</h1>
          <p className="page-subtitle">
            Manage venues and equipment in the UniGo resource catalogue.
          </p>
        </div>

        <Link to="/admin/resources/add" className="primary-link-btn">
          Add Resource
        </Link>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by name, code, kind, category, type or location"
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
          <option value="kind">Resource Kind</option>
          <option value="label">Category</option>
          <option value="type">Type</option>
        </select>

        <select
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="filter-select"
          disabled={!filterType}
        >
          <option value="">Select</option>

          {filterType === 'kind' && (
            <>
              <option value="VENUE">Venue</option>
              <option value="EQUIPMENT">Equipment</option>
            </>
          )}

          {filterType === 'label' &&
            allCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}

          {filterType === 'type' &&
            allTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
        </select>

        <button onClick={handleFilter} className="apply-btn">
          Apply
        </button>

        <button onClick={resetFilters} className="reset-btn">
          Reset
        </button>
      </div>

      {resources.length === 0 ? (
        <p className="info-text">No resources found.</p>
      ) : (
        <div className="resource-card-grid">
          {resources.map((resource) => {
            const equipment = isEquipment(resource.resourceKind)

            return (
              <div className="resource-card" key={resource.id}>
                <div className="resource-card-top">
                  <h2 className="resource-card-name">{resource.name}</h2>
                  <span className="resource-code">{resource.codeName}</span>
                </div>

                <div className="resource-card-meta">
                  <span className={`kind-badge ${equipment ? 'equipment' : 'venue'}`}>
                    {getKindLabel(resource.resourceKind)}
                  </span>

                  <button
                    onClick={() => handleToggleStatus(resource)}
                    className={`status-toggle-btn ${
                      resource.status === 'ACTIVE' ? 'active' : 'inactive'
                    }`}
                  >
                    {resource.status === 'ACTIVE' ? 'Active' : 'Unavailable'}
                  </button>
                </div>

                <Link
                  to={`/admin/resources/view/${resource.id}`}
                  className="view-details-btn"
                >
                  View Details
                </Link>

                <div className="resource-card-actions">
                  <Link
                    to={`/admin/resources/edit/${resource.id}`}
                    className="card-action-btn update-btn"
                  >
                    Update
                  </Link>

                  <button
                    onClick={() => openDeleteModal(resource)}
                    className="card-action-btn delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Resource?"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.name} (${deleteTarget.codeName})?`
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