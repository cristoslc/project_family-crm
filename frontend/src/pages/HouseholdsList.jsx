import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../services/api'
import './ListPage.css'

function HouseholdsList() {
  const [households, setHouseholds] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadHouseholds()
  }, [])

  const loadHouseholds = async () => {
    try {
      const response = await apiClient.get('/households')
      setHouseholds(response.data.data || [])
    } catch (error) {
      console.error('Failed to load households:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHouseholds = households.filter(household =>
    household.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="page-container">Loading...</div>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Households</h1>
        <Link to="/households/new" className="btn-primary">Add Household</Link>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search households..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="list-container">
        {filteredHouseholds.length === 0 ? (
          <div className="empty-state">No households found</div>
        ) : (
          filteredHouseholds.map(household => (
            <Link key={household.id} to={`/households/${household.id}`} className="list-item">
              <div className="list-item-content">
                <div className="list-item-title">{household.name}</div>
                {household.city && (
                  <div className="list-item-subtitle">{household.city}{household.region && `, ${household.region}`}</div>
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

export default HouseholdsList
