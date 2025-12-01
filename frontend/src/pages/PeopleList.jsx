import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../services/api'
import './ListPage.css'

function PeopleList() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadPeople()
  }, [])

  const loadPeople = async () => {
    try {
      const response = await apiClient.get('/people')
      setPeople(response.data.data || [])
    } catch (error) {
      console.error('Failed to load people:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPeople = people.filter(person =>
    person.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.short_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading people...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>People</h1>
        <Link to="/people/new" className="btn-primary">Add Person</Link>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search people..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="list-container">
        {filteredPeople.length === 0 ? (
          <div className="empty-state">No people found</div>
        ) : (
          filteredPeople.map(person => (
            <Link key={person.id} to={`/people/${person.id}`} className="list-item">
              <div className="list-item-content">
                <div className="list-item-title">{person.display_name}</div>
                {person.short_name && person.short_name !== person.display_name && (
                  <div className="list-item-subtitle">{person.short_name}</div>
                )}
                {person.relationship_label && (
                  <div className="list-item-meta">{person.relationship_label}</div>
                )}
              </div>
              <div className="list-item-arrow">→</div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

export default PeopleList
