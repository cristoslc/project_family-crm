import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../services/api'
import './GiftsList.css'

function GiftsList() {
  const [gifts, setGifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('in')
  const [selectedEvent, setSelectedEvent] = useState('')
  const [events, setEvents] = useState([])

  useEffect(() => {
    loadEvents()
    loadGifts()
  }, [activeTab, selectedEvent])

  const loadEvents = async () => {
    try {
      const response = await apiClient.get('/events')
      setEvents(response.data.data || [])
    } catch (error) {
      console.error('Failed to load events:', error)
    }
  }

  const loadGifts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ direction: activeTab })
      if (selectedEvent) params.append('event_id', selectedEvent)
      
      const response = await apiClient.get(`/gifts?${params}`)
      setGifts(response.data.data || [])
    } catch (error) {
      console.error('Failed to load gifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gift?')) return
    
    try {
      await apiClient.delete(`/gifts/${id}`)
      loadGifts()
    } catch (error) {
      alert('Failed to delete gift')
    }
  }

  const totalValue = gifts.reduce((sum, gift) => sum + (parseFloat(gift.est_value) || 0), 0)

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gifts</h1>
        <Link to="/gifts/log" className="btn-primary">Log Gift</Link>
      </div>

      <div className="gifts-filters">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'in' ? 'active' : ''}`}
            onClick={() => setActiveTab('in')}
          >
            Received
          </button>
          <button
            className={`tab ${activeTab === 'out' ? 'active' : ''}`}
            onClick={() => setActiveTab('out')}
          >
            Given
          </button>
        </div>

        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="event-filter"
        >
          <option value="">All Events</option>
          {events.map(event => (
            <option key={event.id} value={event.id}>{event.name}</option>
          ))}
        </select>
      </div>

      {!loading && (
        <div className="gifts-summary">
          <div className="summary-item">
            <span className="summary-label">Total:</span>
            <span className="summary-value">${totalValue.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Count:</span>
            <span className="summary-value">{gifts.length}</span>
          </div>
        </div>
      )}

      <div className="list-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading gifts...</p>
          </div>
        ) : gifts.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁</div>
            <p>No gifts found</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7 }}>Try adjusting your filters</p>
          </div>
        ) : (
          gifts.map(gift => (
            <div key={gift.id} className="gift-item">
              <div className="gift-content">
                <div className="gift-description">{gift.description}</div>
                {gift.est_value && (
                  <div className="gift-value">${parseFloat(gift.est_value).toFixed(2)}</div>
                )}
                {gift.given_date && (
                  <div className="gift-date">{new Date(gift.given_date).toLocaleDateString()}</div>
                )}
              </div>
              <div className="gift-actions">
                <button
                  onClick={() => handleDelete(gift.id)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default GiftsList
