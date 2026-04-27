import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getResourceById } from '../services/resourceService'
import { createBooking } from '../services/bookingService'
import { getKindLabel, isEquipment } from '../utils/resourceOptions'
import '../styles/AdminResourceListPage.css'
import '../styles/ViewResourcePage.css'

export default function ViewResourcePage() {
  const { id } = useParams()

  const role =
    localStorage.getItem('role') ||
    localStorage.getItem('userRole') ||
    localStorage.getItem('unigo_role') ||
    localStorage.getItem('unipulse_role')

  const [resource, setResource] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    bookingDate: '',
    startTime: '',
    endTime: '',
    requestedQuantity: 1,
    purpose: ''
  })

  const canBook = role === 'STUDENT' || role === 'LECTURER'

  const backPath =
    role === 'STUDENT'
      ? '/student/resources'
      : role === 'LECTURER'
      ? '/lecturer/resources'
      : role === 'TECHNICIAN'
      ? '/technician/bookings'
      : '/admin/resources'

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadResource()
  }, [id])

  const loadResource = async () => {
    try {
      const res = await getResourceById(id)
      setResource(res.data)
    } catch {
      toast.error('Failed to load resource details')
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleBooking = async () => {
    if (!form.bookingDate || !form.startTime || !form.endTime || !form.purpose.trim()) {
      toast.error('Please fill all booking fields')
      return
    }

    if (form.bookingDate < today) {
      toast.error('You cannot book a past date')
      return
    }

    if (form.endTime <= form.startTime) {
      toast.error('End time must be after start time')
      return
    }

    if (equipment && Number(form.requestedQuantity) < 1) {
      toast.error('Quantity must be at least 1')
      return
    }

    if (equipment && Number(form.requestedQuantity) > Number(resource.quantity)) {
      toast.error('Requested quantity is higher than available quantity')
      return
    }

    const userId = localStorage.getItem('userId')

    if (!userId) {
      toast.error('User ID not found. Please logout and login again.')
      return
    }

    try {
      await createBooking(id, userId, {
        ...form,
        requestedQuantity: Number(form.requestedQuantity)
      })

      toast.success('Booking request sent!')
      setShowModal(false)

      setForm({
        bookingDate: '',
        startTime: '',
        endTime: '',
        requestedQuantity: 1,
        purpose: ''
      })
    } catch (err) {
      toast.error(err.response?.data || 'Booking failed')
    }
  }

  if (!resource) {
    return (
      <div className="view-resource-page">
        <p className="info-text">Loading resource details...</p>
      </div>
    )
  }

  const equipment = isEquipment(resource.resourceKind)

  return (
    <div className="view-resource-page">
      <div className="view-hero">
        <div>
          <span className="view-kicker">UniGo Resource Details</span>
          <h1>{resource.name}</h1>
          <p>{resource.codeName} • {getKindLabel(resource.resourceKind)}</p>
        </div>

        <Link to={backPath} className="view-back-btn">
          Back
        </Link>
      </div>

      <div className="view-layout">
        <section className="view-main-card">
          <div className="view-card-top">
            <div>
              <h2>{resource.name}</h2>
              <p>{equipment ? 'Equipment resource' : 'Venue resource'}</p>
            </div>

            <span className={`view-status ${resource.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
              {resource.status === 'ACTIVE' ? 'Available' : 'Unavailable'}
            </span>
          </div>

          <div className="view-badge-row">
            <span>{resource.codeName}</span>
            <span>{getKindLabel(resource.resourceKind)}</span>
            <span>{resource.label}</span>
          </div>

          <div className="view-detail-grid">
            <div className="view-detail-box">
              <small>Category</small>
              <strong>{resource.label}</strong>
            </div>

            <div className="view-detail-box">
              <small>Type</small>
              <strong>{resource.type}</strong>
            </div>

            <div className="view-detail-box">
              <small>{equipment ? 'Available Quantity' : 'Capacity'}</small>
              <strong>{equipment ? resource.quantity : resource.capacity}</strong>
            </div>

            <div className="view-detail-box">
              <small>Location</small>
              <strong>{resource.location || 'N/A'}</strong>
            </div>
          </div>

          {canBook && resource.status === 'ACTIVE' && (
            <button className="view-book-btn" onClick={() => setShowModal(true)}>
              Book Resource
            </button>
          )}
        </section>

        <aside className="view-side-card">
          <h3>Booking Rules</h3>
          <p>Submit date, time, quantity if equipment, and purpose. Technician will review your request.</p>

          <div className="view-rule-list">
            <span>Past dates are not allowed</span>
            <span>End time must be after start time</span>
            <span>Equipment quantity reduces after approval</span>
          </div>
        </aside>
      </div>

      {showModal && canBook && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Book Resource</h2>

            <input
              type="date"
              name="bookingDate"
              min={today}
              value={form.bookingDate}
              onChange={handleChange}
              className="input-field"
            />

            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="input-field"
            />

            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className="input-field"
            />

            {equipment && (
              <input
                type="number"
                name="requestedQuantity"
                min="1"
                max={resource.quantity}
                placeholder="Quantity"
                value={form.requestedQuantity}
                onChange={handleChange}
                className="input-field"
              />
            )}

            <textarea
              name="purpose"
              placeholder="Purpose"
              value={form.purpose}
              onChange={handleChange}
              className="input-field"
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="primary-link-btn" onClick={handleBooking}>
                Submit
              </button>

              <button className="danger-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}