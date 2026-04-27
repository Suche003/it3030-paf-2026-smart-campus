import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getResourceById } from '../services/resourceService'
import { getKindLabel, isEquipment } from '../utils/resourceOptions'
import '../styles/AdminResourceListPage.css'

export default function ViewResourcePage() {
  const { id } = useParams()
  const [resource, setResource] = useState(null)

  useEffect(() => {
    loadResource()
  }, [])

  const loadResource = async () => {
    try {
      const res = await getResourceById(id)
      setResource(res.data)
    } catch {
      toast.error('Failed to load resource details')
    }
  }

  if (!resource) {
    return (
      <div className="page-container">
        <p className="info-text">Loading resource details...</p>
      </div>
    )
  }

  const equipment = isEquipment(resource.resourceKind)

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{resource.name}</h1>
          <p className="page-subtitle">Resource Details - {resource.codeName}</p>
        </div>

        <Link to="/admin/resources" className="primary-link-btn">
          Back
        </Link>
      </div>

      <div className="resource-card" style={{ maxWidth: '760px' }}>
        <h2 className="resource-card-name">{resource.name}</h2>

        <div className="resource-card-meta">
          <span className="resource-code">{resource.codeName}</span>
          <span className={`kind-badge ${equipment ? 'equipment' : 'venue'}`}>
            {getKindLabel(resource.resourceKind)}
          </span>
          <span className={`status-toggle-btn ${resource.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
            {resource.status === 'ACTIVE' ? 'Active' : 'Unavailable'}
          </span>
        </div>

        <p><strong>Category:</strong> {resource.label}</p>
        <p><strong>Type:</strong> {resource.type}</p>
        <p><strong>{equipment ? 'Quantity' : 'Capacity'}:</strong> {equipment ? resource.quantity : resource.capacity}</p>
        <p><strong>Location:</strong> {resource.location}</p>
      </div>
    </div>
  )
}