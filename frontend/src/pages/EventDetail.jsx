import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../services/api'
import './DetailPage.css'

function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    loadEvent()
  }, [id])

  const loadEvent = async () => {
    try {
      const response = await apiClient.get(`/events/${id}?include_counts=true`)
      setEvent(response.data.data)
      setFormData(response.data.data)
    } catch (error) {
      console.error('Failed to load event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      await apiClient.patch(`/events/${id}`, formData)
      setEditing(false)
      loadEvent()
    } catch (error) {
      alert('Failed to update event')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return
    try {
      await apiClient.delete(`/events/${id}`)
      navigate('/events')
    } catch (error) {
      alert('Failed to delete event')
    }
  }

  if (loading) {
    return <div className="page-container">Loading...</div>
  }

  if (!event) {
    return <div className="page-container">Event not found</div>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{event.name}</h1>
        <div className="header-actions">
          {editing ? (
            <>
              <button onClick={handleSave} className="btn-primary">Save</button>
              <button onClick={() => { setEditing(false); setFormData(event) }} className="btn-secondary">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="btn-primary">Edit</button>
              <button onClick={handleDelete} className="btn-danger">Delete</button>
            </>
          )}
        </div>
      </div>

      <div className="detail-content">
        {editing ? (
          <>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Event Date</label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Event Type</label>
              <input
                type="text"
                name="event_type"
                value={formData.event_type || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </>
        ) : (
          <>
            <div className="detail-field">
              <label>Name</label>
              <div>{event.name}</div>
            </div>
            {event.event_date && (
              <div className="detail-field">
                <label>Date</label>
                <div>{new Date(event.event_date).toLocaleDateString()}</div>
              </div>
            )}
            <div className="detail-field">
              <label>Type</label>
              <div>{event.event_type}</div>
            </div>
            {event.gift_count !== undefined && (
              <div className="detail-field">
                <label>Gifts</label>
                <div>{event.gift_count}</div>
              </div>
            )}
            {event.card_count !== undefined && (
              <div className="detail-field">
                <label>Cards</label>
                <div>{event.card_count}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default EventDetail
