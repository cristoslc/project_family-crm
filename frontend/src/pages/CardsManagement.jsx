import React, { useState, useEffect } from 'react'
import apiClient from '../services/api'
import './CardsManagement.css'

function CardsManagement() {
  const [cards, setCards] = useState([])
  const [events, setEvents] = useState([])
  const [households, setHouseholds] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadData()
  }, [selectedEvent, statusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [eventsRes, householdsRes] = await Promise.all([
        apiClient.get('/events'),
        apiClient.get('/households')
      ])
      setEvents(eventsRes.data.data || [])
      setHouseholds(householdsRes.data.data || [])

      const params = new URLSearchParams()
      if (selectedEvent) params.append('event_id', selectedEvent)
      if (statusFilter) params.append('status', statusFilter)

      const cardsRes = await apiClient.get(`/cards?${params}`)
      setCards(cardsRes.data.data || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateCardStatus = async (cardId, newStatus) => {
    try {
      await apiClient.patch(`/cards/${cardId}`, { status: newStatus })
      loadData()
    } catch (error) {
      alert('Failed to update card status')
    }
  }

  const statusOptions = ['planned', 'written', 'sent', 'returned']
  const statusColors = {
    planned: '#95a5a6',
    written: '#f39c12',
    sent: '#27ae60',
    returned: '#e74c3c'
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Cards Management</h1>
      </div>

      <div className="cards-filters">
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="filter-select"
        >
          <option value="">All Events</option>
          {events.map(event => (
            <option key={event.id} value={event.id}>{event.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : cards.length === 0 ? (
        <div className="empty-state">No cards found</div>
      ) : (
        <div className="cards-list">
          {cards.map(card => {
            const household = households.find(h => h.id === card.household_id)
            const event = events.find(e => e.id === card.event_id)
            return (
              <div key={card.id} className="card-item">
                <div className="card-info">
                  <div className="card-household">{household?.name || 'Unknown'}</div>
                  <div className="card-event">{event?.name || 'Unknown Event'}</div>
                  {household?.address_line_1 && (
                    <div className="card-address">
                      {household.address_line_1}
                      {household.city && `, ${household.city}`}
                    </div>
                  )}
                </div>
                <div className="card-status-section">
                  <div
                    className="card-status"
                    style={{ backgroundColor: statusColors[card.status] || '#95a5a6' }}
                  >
                    {card.status}
                  </div>
                  <div className="card-status-buttons">
                    {statusOptions.map(status => (
                      <button
                        key={status}
                        onClick={() => updateCardStatus(card.id, status)}
                        className={`status-btn ${card.status === status ? 'active' : ''}`}
                        style={{
                          backgroundColor: card.status === status ? statusColors[status] : 'transparent',
                          color: card.status === status ? 'white' : statusColors[status],
                          borderColor: statusColors[status]
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CardsManagement
