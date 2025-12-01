import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../services/api'
import './GiftForm.css'

function LogGiftGiven() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    event_id: '',
    receiver_type: 'person',
    receiver_person_id: '',
    receiver_household_id: '',
    description: '',
    est_value: '',
    given_date: '',
    notes: '',
    thank_you_sent: false
  })
  const [events, setEvents] = useState([])
  const [people, setPeople] = useState([])
  const [households, setHouseholds] = useState([])
  const [loading, setLoading] = useState(false)
  const [saveAndAdd, setSaveAndAdd] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [eventsRes, peopleRes, householdsRes] = await Promise.all([
        apiClient.get('/events'),
        apiClient.get('/people'),
        apiClient.get('/households')
      ])
      setEvents(eventsRes.data.data || [])
      setPeople(peopleRes.data.data || [])
      setHouseholds(householdsRes.data.data || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const giftData = {
        direction: 'out',
        event_id: formData.event_id || null,
        description: formData.description,
        est_value: formData.est_value ? parseFloat(formData.est_value) : null,
        given_date: formData.given_date || null,
        notes: formData.notes || null,
        thank_you_sent: formData.thank_you_sent
      }

      if (formData.receiver_type === 'person') {
        giftData.receiver_person_id = formData.receiver_person_id || null
      } else {
        giftData.receiver_household_id = formData.receiver_household_id || null
      }

      await apiClient.post('/gifts', giftData)

      if (saveAndAdd) {
        setFormData(prev => ({
          ...prev,
          receiver_person_id: '',
          receiver_household_id: '',
          description: '',
          est_value: '',
          given_date: '',
          notes: '',
          thank_you_sent: false
        }))
        setLoading(false)
      } else {
        navigate('/gifts')
      }
    } catch (error) {
      alert('Failed to save gift: ' + (error.response?.data?.error || error.message))
      setLoading(false)
    }
  }

  const presetValues = [10, 25, 50, 100, 250, 500]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Log Gift We're Giving</h1>
      </div>

      <form onSubmit={handleSubmit} className="gift-form">
        <div className="form-group">
          <label>Event</label>
          <select
            name="event_id"
            value={formData.event_id}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Select event...</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
          <div className="card-selector">
            <div
              className={`card-selector-item ${formData.event_id === '' ? 'selected' : ''}`}
              onClick={() => {
                const select = document.querySelector('select[name="event_id"]')
                if (select) {
                  select.value = ''
                  select.dispatchEvent(new Event('change', { bubbles: true }))
                }
                setFormData(prev => ({ ...prev, event_id: '' }))
              }}
            >
              None
            </div>
            {events.map(event => (
              <div
                key={event.id}
                className={`card-selector-item ${formData.event_id === event.id.toString() ? 'selected' : ''}`}
                onClick={() => {
                  const select = document.querySelector('select[name="event_id"]')
                  if (select) {
                    select.value = event.id.toString()
                    select.dispatchEvent(new Event('change', { bubbles: true }))
                  }
                  setFormData(prev => ({ ...prev, event_id: event.id.toString() }))
                }}
              >
                {event.name}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Receiver Type</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="receiver_type"
                value="person"
                checked={formData.receiver_type === 'person'}
                onChange={handleChange}
              />
              Person
            </label>
            <label>
              <input
                type="radio"
                name="receiver_type"
                value="household"
                checked={formData.receiver_type === 'household'}
                onChange={handleChange}
              />
              Household
            </label>
          </div>
        </div>

        {formData.receiver_type === 'person' ? (
          <div className="form-group">
            <label>Receiver (Person)</label>
            <select
              name="receiver_person_id"
              value={formData.receiver_person_id}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select person...</option>
              {people.map(person => (
                <option key={person.id} value={person.id}>{person.display_name}</option>
              ))}
            </select>
            <div className="card-selector">
              <div
                className={`card-selector-item ${formData.receiver_person_id === '' ? 'selected' : ''}`}
                onClick={() => {
                  const select = document.querySelector('select[name="receiver_person_id"]')
                  if (select) {
                    select.value = ''
                    select.dispatchEvent(new Event('change', { bubbles: true }))
                  }
                  setFormData(prev => ({ ...prev, receiver_person_id: '' }))
                }}
              >
                None
              </div>
              {people.map(person => (
                <div
                  key={person.id}
                  className={`card-selector-item ${formData.receiver_person_id === person.id.toString() ? 'selected' : ''}`}
                  onClick={() => {
                    const select = document.querySelector('select[name="receiver_person_id"]')
                    if (select) {
                      select.value = person.id.toString()
                      select.dispatchEvent(new Event('change', { bubbles: true }))
                    }
                    setFormData(prev => ({ ...prev, receiver_person_id: person.id.toString() }))
                  }}
                >
                  {person.display_name}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label>Receiver (Household)</label>
            <select
              name="receiver_household_id"
              value={formData.receiver_household_id}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select household...</option>
              {households.map(household => (
                <option key={household.id} value={household.id}>{household.name}</option>
              ))}
            </select>
            <div className="card-selector">
              <div
                className={`card-selector-item ${formData.receiver_household_id === '' ? 'selected' : ''}`}
                onClick={() => {
                  const select = document.querySelector('select[name="receiver_household_id"]')
                  if (select) {
                    select.value = ''
                    select.dispatchEvent(new Event('change', { bubbles: true }))
                  }
                  setFormData(prev => ({ ...prev, receiver_household_id: '' }))
                }}
              >
                None
              </div>
              {households.map(household => (
                <div
                  key={household.id}
                  className={`card-selector-item ${formData.receiver_household_id === household.id.toString() ? 'selected' : ''}`}
                  onClick={() => {
                    const select = document.querySelector('select[name="receiver_household_id"]')
                    if (select) {
                      select.value = household.id.toString()
                      select.dispatchEvent(new Event('change', { bubbles: true }))
                    }
                    setFormData(prev => ({ ...prev, receiver_household_id: household.id.toString() }))
                  }}
                >
                  {household.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Description *</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Estimated Value</label>
          <div className="preset-buttons">
            {presetValues.map(value => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, est_value: value }))}
                className={`preset-btn ${formData.est_value == value ? 'active' : ''}`}
              >
                ${value}
              </button>
            ))}
          </div>
          <input
            type="number"
            name="est_value"
            value={formData.est_value}
            onChange={handleChange}
            className="form-input"
            placeholder="Custom amount"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label>Date Given</label>
          <input
            type="date"
            name="given_date"
            value={formData.given_date}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="form-input"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="thank_you_sent"
              checked={formData.thank_you_sent}
              onChange={handleChange}
            />
            Thank you sent
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => {
              setSaveAndAdd(true)
              handleSubmit({ preventDefault: () => {} })
            }}
            className="btn-secondary"
            disabled={loading}
          >
            Save & Add Another
          </button>
          <button
            type="submit"
            onClick={() => setSaveAndAdd(false)}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save & Done'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default LogGiftGiven
