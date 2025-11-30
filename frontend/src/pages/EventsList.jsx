import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../services/api'
import './ListPage.css'

function EventsList() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const response = await apiClient.get('/events')
      setEvents(response.data.data || [])
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="page-container">Loading...</div>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Events</h1>
        <Link to="/events/new" className="btn-primary">Add Event</Link>
      </div>

      <div className="list-container">
        {events.length === 0 ? (
          <div className="empty-state">No events found</div>
        ) : (
          events.map(event => (
            <Link key={event.id} to={`/events/${event.id}`} className="list-item">
              <div className="list-item-content">
                <div className="list-item-title">{event.name}</div>
                {event.event_date && (
                  <div className="list-item-subtitle">
                    {new Date(event.event_date).toLocaleDateString()}
                  </div>
                )}
                <div className="list-item-meta">{event.event_type}</div>
              </div>
              <div className="list-item-arrow">→</div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

export default EventsList
