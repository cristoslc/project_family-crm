import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../services/api'
import './DetailPage.css'

function HouseholdDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [household, setHousehold] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    loadHousehold()
  }, [id])

  const loadHousehold = async () => {
    try {
      const response = await apiClient.get(`/households/${id}?include_members=true`)
      setHousehold(response.data.data)
      setFormData(response.data.data)
    } catch (error) {
      console.error('Failed to load household:', error)
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
      await apiClient.patch(`/households/${id}`, formData)
      setEditing(false)
      loadHousehold()
    } catch (error) {
      alert('Failed to update household')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this household?')) return
    try {
      await apiClient.delete(`/households/${id}`)
      navigate('/households')
    } catch (error) {
      alert('Failed to delete household')
    }
  }

  if (loading) {
    return <div className="page-container">Loading...</div>
  }

  if (!household) {
    return <div className="page-container">Household not found</div>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{household.name}</h1>
        <div className="header-actions">
          {editing ? (
            <>
              <button onClick={handleSave} className="btn-primary">Save</button>
              <button onClick={() => { setEditing(false); setFormData(household) }} className="btn-secondary">Cancel</button>
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
              <label>Address Line 1</label>
              <input
                type="text"
                name="address_line_1"
                value={formData.address_line_1 || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Region</label>
              <input
                type="text"
                name="region"
                value={formData.region || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Card Greeting Name</label>
              <input
                type="text"
                name="card_greeting_name"
                value={formData.card_greeting_name || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </>
        ) : (
          <>
            <div className="detail-field">
              <label>Name</label>
              <div>{household.name}</div>
            </div>
            {household.address_line_1 && (
              <div className="detail-field">
                <label>Address</label>
                <div>
                  {household.address_line_1}
                  {household.address_line_2 && <><br />{household.address_line_2}</>}
                  {(household.city || household.region) && (
                    <>
                      <br />
                      {household.city}{household.city && household.region ? ', ' : ''}{household.region} {household.postal_code}
                    </>
                  )}
                </div>
              </div>
            )}
            {household.card_greeting_name && (
              <div className="detail-field">
                <label>Card Greeting Name</label>
                <div>{household.card_greeting_name}</div>
              </div>
            )}
          </>
        )}

        {household.members && household.members.length > 0 && (
          <div className="detail-section">
            <h2>Members</h2>
            <div className="list-container">
              {household.members.map(member => (
                <div key={member.id} className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title">{member.display_name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HouseholdDetail
