import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../services/api'
import './DetailPage.css'

function PersonDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [person, setPerson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    loadPerson()
  }, [id])

  const loadPerson = async () => {
    try {
      const response = await apiClient.get(`/people/${id}`)
      setPerson(response.data.data)
      setFormData(response.data.data)
    } catch (error) {
      console.error('Failed to load person:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async () => {
    try {
      await apiClient.patch(`/people/${id}`, formData)
      setEditing(false)
      loadPerson()
    } catch (error) {
      alert('Failed to update person')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this person?')) return
    try {
      await apiClient.delete(`/people/${id}`)
      navigate('/people')
    } catch (error) {
      alert('Failed to delete person')
    }
  }

  if (loading) {
    return <div className="page-container">Loading...</div>
  }

  if (!person) {
    return <div className="page-container">Person not found</div>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{person.display_name}</h1>
        <div className="header-actions">
          {editing ? (
            <>
              <button onClick={handleSave} className="btn-primary">Save</button>
              <button onClick={() => { setEditing(false); setFormData(person) }} className="btn-secondary">Cancel</button>
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
          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              name="display_name"
              value={formData.display_name || ''}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        ) : (
          <div className="detail-field">
            <label>Display Name</label>
            <div>{person.display_name}</div>
          </div>
        )}

        {editing ? (
          <div className="form-group">
            <label>Short Name</label>
            <input
              type="text"
              name="short_name"
              value={formData.short_name || ''}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        ) : (
          person.short_name && (
            <div className="detail-field">
              <label>Short Name</label>
              <div>{person.short_name}</div>
            </div>
          )
        )}

        {editing ? (
          <div className="form-group">
            <label>Relationship Label</label>
            <input
              type="text"
              name="relationship_label"
              value={formData.relationship_label || ''}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        ) : (
          person.relationship_label && (
            <div className="detail-field">
              <label>Relationship</label>
              <div>{person.relationship_label}</div>
            </div>
          )
        )}

        {editing ? (
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="is_child"
                checked={formData.is_child || false}
                onChange={handleChange}
              />
              Is Child
            </label>
          </div>
        ) : (
          person.is_child && (
            <div className="detail-field">
              <label>Is Child</label>
              <div>Yes</div>
            </div>
          )
        )}

        {person.notes && (
          <div className="detail-field">
            <label>Notes</label>
            <div>{person.notes}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PersonDetail
